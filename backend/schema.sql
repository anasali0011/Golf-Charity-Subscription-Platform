-- PostgreSQL DB Schema (Supabase compatible)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE Charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT
);

CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed
    subscription_status VARCHAR(50) DEFAULT 'inactive', -- active, inactive, cancelled
    charity_id UUID REFERENCES Charities(id),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL, -- monthly, yearly
    status VARCHAR(50) DEFAULT 'active', -- active, past_due, canceled
    stripe_subscription_id VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 1 AND score <= 45),
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month VARCHAR(20) NOT NULL, -- e.g., '2023-10'
    numbers_generated INT[] NOT NULL,
    status VARCHAR(50) DEFAULT 'completed', -- completed, pending
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID REFERENCES Draws(id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    match_type VARCHAR(50) NOT NULL, -- 5_match, 4_match, 3_match
    prize_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_scores_user_id ON Scores(user_id);
CREATE INDEX idx_subscriptions_user_id ON Subscriptions(user_id);
CREATE INDEX idx_winners_user_id ON Winners(user_id);
