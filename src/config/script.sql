CREATE DATABASE cargarte_db;

CREATE TYPE route_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Cancelled');

CREATE TABLE vehicle_brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicle_models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES vehicle_brands(id),
    name VARCHAR(50) NOT NULL,
    UNIQUE (brand_id, name),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    plate VARCHAR(10) UNIQUE NOT NULL,
    model_id INTEGER REFERENCES vehicle_models(id),
    color VARCHAR(30) NOT NULL,
    cargo_capacity NUMERIC(10,2) NOT NULL CHECK (cargo_capacity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    identification VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    license_number VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status route_status DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_driver_date UNIQUE (driver_id, date),
    CONSTRAINT unique_vehicle_date UNIQUE (vehicle_id, date)
);

CREATE TABLE delivery_points (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    address TEXT NOT NULL,
    packages_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    
    CONSTRAINT chk_packages_count_positive CHECK (packages_count >= 0)
);

--triggers

-- Usará todas las tablas este trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER update_vehicle_brands_timestamp
    BEFORE UPDATE ON vehicle_brands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vehicle_models_timestamp
    BEFORE UPDATE ON vehicle_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vehicles_timestamp
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_drivers_timestamp
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_routes_timestamp
    BEFORE UPDATE ON routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_delivery_points_timestamp
    BEFORE UPDATE ON delivery_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

--procedimientos

-- Procedimiento para traer todos los vehículos con sus detalles
CREATE OR REPLACE FUNCTION get_vehicles()
RETURNS TABLE (
    plate VARCHAR,
    brand_name VARCHAR,
    model_name VARCHAR,
    color VARCHAR,
    cargo_capacity NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.plate,
        b.name AS brand_name,
        m.name AS model_name,
        v.color,
        v.cargo_capacity
    FROM vehicles v
    JOIN vehicle_models m ON v.model_id = m.id
    JOIN vehicle_brands b ON m.brand_id = b.id
    ORDER BY v.plate;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para buscar un vehículo por placa
CREATE OR REPLACE FUNCTION get_vehicle_by_plate(p_plate VARCHAR)
RETURNS TABLE (
    plate VARCHAR,
    brand_name VARCHAR,
    model_name VARCHAR,
    color VARCHAR,
    cargo_capacity NUMERIC,
    message VARCHAR
) AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM vehicles v WHERE v.plate ILIKE p_plate
    ) THEN
        RETURN QUERY
        SELECT 
            v.plate,
            b.name AS brand_name,
            m.name AS model_name,
            v.color,
            v.cargo_capacity,
            'Vehiculo encontrado'::VARCHAR AS message
        FROM vehicles v
        JOIN vehicle_models m ON v.model_id = m.id
        JOIN vehicle_brands b ON m.brand_id = b.id
        WHERE v.plate ILIKE p_plate;
    ELSE
        RETURN QUERY
        SELECT 
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::NUMERIC,
            'Vehiculo no encontrado'::VARCHAR AS message;
    END IF;
END;
$$ LANGUAGE plpgsql;

--crear un vehículo

CREATE OR REPLACE FUNCTION create_vehicle(
    p_plate VARCHAR,
    p_model_id INTEGER,
    p_color VARCHAR,
    p_cargo_capacity NUMERIC
)
RETURNS TABLE (
    success BOOLEAN,
    message VARCHAR,
    plate VARCHAR,
    brand_name VARCHAR,
    model_name VARCHAR,
    color VARCHAR,
    cargo_capacity NUMERIC
) AS $$
BEGIN

    IF EXISTS (SELECT 1 FROM vehicles v WHERE v.plate = p_plate) THEN
        RETURN QUERY SELECT 
            false,
            'La placa ya está registrada'::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::NUMERIC;
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM vehicle_models WHERE id = p_model_id) THEN
        RETURN QUERY SELECT 
            false,
            'El modelo seleccionado no existe'::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::VARCHAR,
            NULL::NUMERIC;
        RETURN;
    END IF;

    INSERT INTO vehicles (
        plate,
        model_id,
        color,
        cargo_capacity
    ) VALUES (
        p_plate,
        p_model_id,
        p_color,
        p_cargo_capacity
    );

    RETURN QUERY
    SELECT 
        true,
        'Vehículo creado exitosamente'::VARCHAR,
        v.plate,
        b.name,
        m.name,
        v.color,
        v.cargo_capacity
    FROM vehicles v
    JOIN vehicle_models m ON v.model_id = m.id
    JOIN vehicle_brands b ON m.brand_id = b.id
    WHERE v.plate = p_plate;
    
END;
$$ LANGUAGE plpgsql;

--Procedimiento para tener marcas
CREATE OR REPLACE FUNCTION get_brands()
RETURNS TABLE (
    id INTEGER,
    name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.name
    FROM vehicle_brands b
    ORDER BY b.name;
END;
$$ LANGUAGE plpgsql;

--Procedimiento para tener los modelos por marca

CREATE OR REPLACE FUNCTION get_models_by_brand(brand_id_param INTEGER)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR
) AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM vehicle_brands v_b WHERE v_b.id = brand_id_param
    ) THEN
        RETURN QUERY
        SELECT 
            m.id,
            m.name
        FROM vehicle_models m
        WHERE m.brand_id = brand_id_param
        ORDER BY m.name;
    ELSE
        RAISE EXCEPTION 'Marca no encontrada';
    END IF;
END;
$$ LANGUAGE plpgsql;
--inserts
-- Insertar marcas de vehículos
INSERT INTO vehicle_brands (name) VALUES
    ('Chevrolet'),
    ('Renault'),
    ('Nissan'),
    ('Volkswagen'),
    ('Mercedes-Benz'),
    ('Hyundai'),
    ('Kia'),
    ('Ford'),
    ('Toyota'),
    ('Fiat');

-- Insertar modelos por marca
INSERT INTO vehicle_models (brand_id, name) VALUES
    -- Chevrolet
    (1, 'N300 Cargo'),
    (1, 'NHR'),
    (1, 'NPR'),
    
    -- Renault
    (2, 'Kangoo'),
    (2, 'Master'),
    (2, 'Trafic'),
    
    -- Nissan
    (3, 'NP300'),
    (3, 'Frontier'),
    (3, 'Urvan'),
    
    -- Volkswagen
    (4, 'Transporter'),
    (4, 'Crafter'),
    (4, 'Amarok'),
    
    -- Mercedes-Benz
    (5, 'Sprinter'),
    (5, 'Vito'),
    (5, 'Atego'),
    
    -- Hyundai
    (6, 'H1 Cargo'),
    (6, 'HD78'),
    (6, 'Porter'),
    
    -- Kia
    (7, 'K2500'),
    (7, 'K3000'),
    (7, 'Frontier'),
    
    -- Ford
    (8, 'Transit'),
    (8, 'F-150'),
    (8, 'Ranger'),
    
    -- Toyota
    (9, 'Hilux'),
    (9, 'Hiace'),
    (9, 'Dyna'),
    
    -- Fiat
    (10, 'Ducato'),
    (10, 'Fiorino'),
    (10, 'Dobló Cargo');

INSERT INTO vehicles (plate, model_id, color, cargo_capacity) VALUES
    -- Chevrolet N300 Cargo (furgoneta pequeña)
    ('ABC123', 1, 'White', 50.00),  -- 50 paquetes
    ('DEF456', 1, 'Silver', 50.00),

    -- Chevrolet NHR (camión pequeño)
    ('GHI789', 2, 'White', 150.00),  -- 150 paquetes
    ('JKL012', 2, 'Gray', 150.00),

    -- Chevrolet NPR (camión mediano)
    ('MNO345', 3, 'White', 300.00),  -- 300 paquetes
    ('PQR678', 3, 'Blue', 300.00),

    -- Renault Kangoo (furgoneta pequeña)
    ('STU901', 4, 'White', 45.00),  -- 45 paquetes
    ('VWX234', 4, 'Red', 45.00),

    -- Renault Master (furgoneta grande)
    ('YZA567', 5, 'White', 120.00),  -- 120 paquetes
    ('BCD890', 5, 'Black', 120.00),

    -- Renault Trafic (furgoneta mediana)
    ('EFG123', 6, 'Silver', 80.00),  -- 80 paquetes
    ('HIJ456', 6, 'White', 80.00);

--consultas

-- Traer todos los vehículos
SELECT * FROM get_vehicles();

-- Buscar un vehículo específico por placa
SELECT * FROM get_vehicle_by_plate('ABC123');

--Crear un vehículo
SELECT * FROM create_vehicle('OBC123', 28, 'White', 55);

--actualizar

--eliminar

--tener marcas
SELECT * FROM get_brands();

--tener modelos por marca
SELECT * FROM get_models_by_brand(1);
