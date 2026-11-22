-- Build First: Relational Database Schema (PostgreSQL / Supabase Compatible)
-- Core tables: users, problems, problem_upvotes, solutions, messages, deals

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users & Builder Portfolio Profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  active_role TEXT NOT NULL DEFAULT 'poster' CHECK (active_role IN ('poster', 'builder')),
  headline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  tech_stack TEXT[] DEFAULT '{}',
  github_url TEXT DEFAULT '',
  portfolio_url TEXT DEFAULT '',
  solutions_built_count INTEGER NOT NULL DEFAULT 0,
  deals_closed_count INTEGER NOT NULL DEFAULT 0,
  total_upvotes_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Problems (Posted by everyday users / business owners)
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 160),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 20 AND 4000),
  category TEXT NOT NULL CHECK (
    category IN (
      'Business & Retail',
      'Education',
      'Personal Productivity',
      'E-commerce',
      'Automation',
      'Other'
    )
  ),
  status TEXT NOT NULL DEFAULT 'Open for Builders' CHECK (
    status IN ('Open for Builders', 'In Progress', 'Solution Ready')
  ),
  urgency TEXT NOT NULL DEFAULT 'Standard' CHECK (urgency IN ('Low', 'Standard', 'Urgent')),
  has_budget BOOLEAN NOT NULL DEFAULT FALSE,
  budget_amount NUMERIC(12, 2),
  budget_currency TEXT DEFAULT 'USD' CHECK (budget_currency IN ('USD', 'BDT', 'EUR')),
  upvotes_count INTEGER NOT NULL DEFAULT 1,
  active_builders_count INTEGER NOT NULL DEFAULT 0,
  solutions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Problem Upvotes ("Me Too" demand validation)
CREATE TABLE IF NOT EXISTS problem_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (problem_id, user_id)
);

-- 4. Solutions (Working prototypes built first and pitched to problem posters)
CREATE TABLE IF NOT EXISTS solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  builder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  pitch TEXT NOT NULL CHECK (char_length(pitch) BETWEEN 15 AND 3000),
  live_demo_url TEXT NOT NULL,
  video_walkthrough_url TEXT DEFAULT '',
  screenshot_url TEXT DEFAULT '',
  licensing_model TEXT NOT NULL CHECK (
    licensing_model IN (
      'One-Time Exclusive Buyout',
      'Multi-User License (SaaS/Template)',
      'Free / Open-Source Portfolio Project'
    )
  ),
  price_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price_currency TEXT NOT NULL DEFAULT 'USD' CHECK (price_currency IN ('USD', 'BDT', 'EUR')),
  tech_stack TEXT[] DEFAULT '{}',
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Deals (Negotiation & Escrow lifecycle between Problem Poster & Builder)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  poster_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  builder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offer_amount NUMERIC(12, 2) NOT NULL CHECK (offer_amount >= 0),
  offer_currency TEXT NOT NULL DEFAULT 'USD' CHECK (offer_currency IN ('USD', 'BDT', 'EUR')),
  licensing_model TEXT NOT NULL,
  escrow_status TEXT NOT NULL DEFAULT 'Negotiating' CHECK (
    escrow_status IN (
      'Negotiating',
      'Payment Held in Escrow',
      'Code/Access Delivered',
      'Completed'
    )
  ),
  customization_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Messages (Real-time Deal Room chat & formal offer events)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (
    message_type IN ('text', 'customization_request', 'formal_offer', 'escrow_update')
  ),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  offer_amount NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problems_category_status ON problems(category, status);
CREATE INDEX IF NOT EXISTS idx_problems_upvotes ON problems(upvotes_count DESC);
CREATE INDEX IF NOT EXISTS idx_solutions_problem_id ON solutions(problem_id);
CREATE INDEX IF NOT EXISTS idx_deals_participants ON deals(poster_id, builder_id);
CREATE INDEX IF NOT EXISTS idx_messages_deal_created ON messages(deal_id, created_at ASC);
