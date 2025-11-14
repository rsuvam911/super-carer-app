# Requirements Document

## Introduction

This specification defines the requirements for migrating environment file references from `.env.local` to `.env` throughout the Super Carer App codebase. The change will standardize environment variable management and align with the project's existing `.gitignore` configuration, which already excludes `.env` from version control.

## Glossary

- **Environment File**: A file containing environment variables used to configure the application at runtime
- **Docker Compose**: A tool for defining and running multi-container Docker applications
- **Documentation**: Project README and setup instructions for developers
- **Build Configuration**: Files that control how the application is built and deployed (.dockerignore)

## Requirements

### Requirement 1

**User Story:** As a developer, I want to use `.env` as the standard environment file, so that I follow common conventions and reduce confusion about which file to use.

#### Acceptance Criteria

1. WHEN a developer reads the README documentation, THE Documentation SHALL instruct copying `.env.example` to `.env` instead of `.env.local`
2. WHEN a developer follows setup instructions, THE Documentation SHALL reference `.env` for all environment variable configuration steps
3. WHEN a developer deploys to production, THE Documentation SHALL reference `.env` in deployment instructions

### Requirement 2

**User Story:** As a DevOps engineer, I want Docker Compose to load environment variables from `.env`, so that the application configuration is consistent across development and production environments.

#### Acceptance Criteria

1. WHEN Docker Compose starts the production application, THE Docker Compose SHALL load environment variables from the `.env` file
2. WHEN Docker Compose starts the development application, THE Docker Compose SHALL load environment variables from the `.env` file
3. WHEN Docker builds an image, THE Build Configuration SHALL exclude `.env` from the Docker context while keeping `.env.local` excluded for backward compatibility

### Requirement 3

**User Story:** As a security-conscious developer, I want documentation to warn against committing `.env` to version control, so that sensitive credentials remain protected.

#### Acceptance Criteria

1. WHEN a developer reads security documentation, THE Documentation SHALL warn against committing `.env` to version control
2. WHEN a developer reviews the security section, THE Documentation SHALL reference `.env` instead of `.env.local` in security warnings
