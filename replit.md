# Cannabis E-commerce Web Application

## Overview

This is a comprehensive cannabis e-commerce web application built with React, TypeScript, and Express.js. The application features a bilingual (Myanmar/English) client-facing storefront and a secure admin management panel. The system is designed to showcase cannabis products organized by quality tiers with rich media support, contact integration, and comprehensive content management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: Custom bilingual support for Myanmar and English languages

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Data Validation**: Zod schemas for type-safe data validation
- **Storage Layer**: Abstracted storage interface supporting both in-memory and database implementations
- **Development**: Hot module replacement via Vite integration

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Supabase)
- **Schema Structure**:
  - Users table for admin authentication
  - Products table with multilingual JSON fields and quality tiers
  - Site content table for CMS functionality
  - Contact info table for platform integration
  - FAQ items table with multilingual support
- **Data Types**: Extensive use of JSON columns for multilingual content and flexible data structures

### Authentication & Authorization
- **Client Auth**: Supabase authentication integration
- **Admin Access**: Simple username/password authentication
- **Session Management**: Supabase session handling with React hooks
- **Route Protection**: Admin routes protected with authentication checks

### Product Management System
- **Quality Tiers**: Three-tier system (High, Medium, Low) with localized labels
- **Media Support**: Multiple images and videos per product
- **Multilingual Content**: JSON-based content storage for Myanmar and English
- **Specifications**: Flexible specification lists in both languages
- **Active Status**: Soft delete functionality with active/inactive states

### Content Management
- **Dynamic Sections**: Configurable site sections (about, how-to-order, FAQ)
- **Multilingual CMS**: Full content management in both languages
- **Contact Integration**: QR codes and direct links for Telegram, WhatsApp, and Messenger
- **FAQ System**: Question/answer pairs with ordering and active status

### File Upload & Media
- **Cloud Storage**: Google Cloud Storage integration
- **Upload Library**: Uppy.js for file uploads with AWS S3 compatibility
- **Image Handling**: Support for multiple product images with responsive display
- **Video Support**: Video gallery functionality for product demonstrations

## External Dependencies

### Database & Backend Services
- **Supabase**: Primary database hosting and authentication service
- **Neon Database**: Serverless PostgreSQL database driver (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database operations and migrations

### Cloud Services
- **Google Cloud Storage**: File and media storage (@google-cloud/storage)
- **Vercel**: Deployment platform (configured for production builds)

### UI & Component Libraries
- **Radix UI**: Headless UI primitives for accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Component variant management

### File Upload & Media Processing
- **Uppy**: File upload library with dashboard UI (@uppy/core, @uppy/dashboard, @uppy/aws-s3)
- **React Integration**: Uppy React wrapper (@uppy/react)

### Development Tools
- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### Communication Platforms
- **Telegram**: Direct messaging integration
- **WhatsApp**: Business messaging support
- **Facebook Messenger**: Social media messaging integration