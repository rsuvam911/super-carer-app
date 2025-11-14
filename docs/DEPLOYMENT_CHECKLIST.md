# Docker Deployment Checklist

Use this checklist to ensure a smooth deployment of the Super Carer App using Docker.

## Pre-Deployment

### Environment Setup

- [ ] Docker Engine 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] At least 2GB RAM available
- [ ] At least 5GB disk space available
- [ ] Git repository cloned

### Configuration Files

- [ ] `.env` file created from `.env.example`
- [ ] `NEXT_PUBLIC_API_BASE_URL` set correctly
- [ ] `NEXT_PUBLIC_SOCKET_URL` set correctly (use `wss://` for production)
- [ ] SSL certificates prepared (if using Nginx with HTTPS)
- [ ] `nginx.conf` reviewed and customized (if using Nginx)

### Security Review

- [ ] `.env` file is in `.gitignore`
- [ ] No sensitive data in Docker images
- [ ] SSL/TLS certificates configured (production)
- [ ] Firewall rules configured
- [ ] Non-root user execution verified

## Deployment Steps

### Initial Build

- [ ] Run `docker-compose build --no-cache`
- [ ] Verify build completes without errors
- [ ] Check image size is reasonable (< 500MB for app)

### First Start

- [ ] Run `docker-compose up -d`
- [ ] Wait for services to start (check with `docker-compose ps`)
- [ ] Verify all services are "healthy"
- [ ] Check logs for errors: `docker-compose logs`

### Health Checks

- [ ] App health check: `curl http://localhost:3000/api/health`
- [ ] Redis health check: `docker-compose exec redis redis-cli ping`
- [ ] Nginx health check: `curl http://localhost/health` (if using Nginx)
- [ ] WebSocket connection test

### Functional Testing

- [ ] Access application at http://localhost:3000
- [ ] Test user login
- [ ] Test API connectivity
- [ ] Test WebSocket connection
- [ ] Test file uploads (if applicable)
- [ ] Test booking functionality
- [ ] Test time tracking functionality
- [ ] Test invoice download

### Performance Verification

- [ ] Check container resource usage: `docker stats`
- [ ] Verify response times are acceptable
- [ ] Test under expected load
- [ ] Check Redis cache is working
- [ ] Verify Nginx compression (if using)

## Post-Deployment

### Monitoring Setup

- [ ] Configure log aggregation
- [ ] Set up health check monitoring
- [ ] Configure alerts for service failures
- [ ] Set up resource usage monitoring
- [ ] Configure backup schedule

### Documentation

- [ ] Document deployment date and version
- [ ] Update runbook with any custom configurations
- [ ] Document any issues encountered and solutions
- [ ] Share access credentials securely

### Backup Verification

- [ ] Test Redis backup: `make backup-redis`
- [ ] Verify backup files are created
- [ ] Test restore procedure
- [ ] Document backup location

## Production Checklist (Additional)

### Security Hardening

- [ ] Enable HTTPS/SSL
- [ ] Configure rate limiting in Nginx
- [ ] Set up fail2ban or similar
- [ ] Enable Docker security scanning
- [ ] Review and minimize exposed ports
- [ ] Configure network policies

### High Availability (Optional)

- [ ] Set up load balancer
- [ ] Configure multiple app instances
- [ ] Set up Redis replication
- [ ] Configure automatic failover
- [ ] Test disaster recovery

### Compliance

- [ ] GDPR compliance verified (if applicable)
- [ ] HIPAA compliance verified (if applicable)
- [ ] Data retention policies configured
- [ ] Audit logging enabled
- [ ] Privacy policy updated

## Rollback Plan

### If Deployment Fails

1. [ ] Stop new containers: `docker-compose down`
2. [ ] Restore previous version
3. [ ] Verify old version works
4. [ ] Document failure reason
5. [ ] Plan fix for next deployment

### Rollback Commands

```bash
# Stop current deployment
docker-compose down

# Restore from backup (if needed)
docker cp ./backup/redis-YYYYMMDD-HHMMSS.rdb super-carer-redis:/data/dump.rdb

# Start previous version
git checkout <previous-version>
docker-compose build --no-cache
docker-compose up -d
```

## Maintenance Schedule

### Daily

- [ ] Check service health
- [ ] Review error logs
- [ ] Monitor resource usage

### Weekly

- [ ] Review application logs
- [ ] Check disk space
- [ ] Verify backups are running
- [ ] Update security patches

### Monthly

- [ ] Update Docker images
- [ ] Review and rotate logs
- [ ] Performance optimization review
- [ ] Security audit

## Emergency Contacts

- **DevOps Lead:** ********\_********
- **Backend Team:** ********\_********
- **Infrastructure:** ********\_********
- **On-Call:** ********\_********

## Useful Commands

```bash
# Quick health check
make health

# View logs
docker-compose logs -f app

# Restart service
docker-compose restart app

# Check resource usage
docker stats

# Backup Redis
make backup-redis

# Clean restart
docker-compose down && docker-compose up -d

# Emergency stop
docker-compose down
```

## Sign-Off

- [ ] Deployment completed successfully
- [ ] All tests passed
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team notified

**Deployed by:** ********\_********  
**Date:** ********\_********  
**Version:** ********\_********  
**Notes:** ********\_********
