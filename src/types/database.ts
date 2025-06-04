
// Database table structures for Supabase implementation

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  type: 'rider' | 'admin';
  photo?: string;
  matricule?: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMileageEntry {
  id: string;
  rider_id: string;
  type: 'ouverture' | 'fermeture' | 'carburant';
  shift: 1 | 2;
  kilometrage: number;
  amount?: number; // Montant en CDF pour les relevés carburant
  photo_url: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface DatabaseAuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  created_at: string;
}

// SQL Schema for Supabase
export const DATABASE_SCHEMA = `
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(10) CHECK (type IN ('rider', 'admin')) NOT NULL,
  photo TEXT,
  matricule VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mileage entries table
CREATE TABLE mileage_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('ouverture', 'fermeture', 'carburant')) NOT NULL,
  shift INTEGER CHECK (shift IN (1, 2)) NOT NULL,
  kilometrage INTEGER NOT NULL,
  amount DECIMAL(10, 2), -- Montant en CDF pour carburant
  photo_url TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for authentication
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table for tracking changes
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_mileage_entries_rider_id ON mileage_entries(rider_id);
CREATE INDEX idx_mileage_entries_date ON mileage_entries(date);
CREATE INDEX idx_mileage_entries_type ON mileage_entries(type);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data, admins can see all
CREATE POLICY users_policy ON users
  FOR ALL
  USING (
    auth.uid()::text = id::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND type = 'admin')
  );

-- Riders can only see their entries, admins can see all
CREATE POLICY mileage_entries_policy ON mileage_entries
  FOR ALL
  USING (
    rider_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND type = 'admin')
  );

-- Users can only see their own sessions
CREATE POLICY sessions_policy ON sessions
  FOR ALL
  USING (user_id::text = auth.uid()::text);

-- Only admins can see audit logs
CREATE POLICY audit_logs_policy ON audit_logs
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND type = 'admin')
  );

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mileage_entries_updated_at 
  BEFORE UPDATE ON mileage_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create audit triggers
CREATE TRIGGER users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER mileage_entries_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON mileage_entries
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();
`;

// API endpoints structure for Supabase Edge Functions
export const API_ENDPOINTS = {
  // Authentication
  login: '/auth/login',
  logout: '/auth/logout',
  refreshToken: '/auth/refresh',
  
  // Users
  getUsers: '/api/users',
  createUser: '/api/users',
  updateUser: '/api/users/:id',
  deleteUser: '/api/users/:id',
  getUserProfile: '/api/users/profile',
  
  // Mileage entries
  getMileageEntries: '/api/mileage-entries',
  createMileageEntry: '/api/mileage-entries',
  updateMileageEntry: '/api/mileage-entries/:id',
  deleteMileageEntry: '/api/mileage-entries/:id',
  getMileageEntriesByRider: '/api/mileage-entries/rider/:riderId',
  
  // Reports
  getReports: '/api/reports',
  exportReports: '/api/reports/export',
  
  // File upload
  uploadPhoto: '/api/upload/photo',
  deletePhoto: '/api/upload/photo/:filename'
};
