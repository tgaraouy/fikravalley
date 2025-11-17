# Admin Dashboard Documentation

Comprehensive admin interface for managing the Fikra Valley idea bank.

## Features

### 1. Overview Stats
- **Total Ideas**: Count of all submitted ideas
- **Ideas by Tier**: Breakdown by qualification (Exceptional ≥30, Qualified ≥25, Developing ≥15, Pending)
- **Receipt Verification**: Total and verified receipt counts
- **Funding Success Rate**: Percentage of ideas that received funding
- **User Engagement**: Active users, upvotes, problem validations

### 2. Idea Management
- **Table View**: All ideas with key information
- **Filters**: Status, score range, category, qualification tier
- **Search**: Full-text search across titles and descriptions
- **Bulk Actions**: Approve, reject, or flag multiple ideas
- **Score Overrides**: Manual scoring adjustments
- **Quick Actions**: Edit, view details, override scores

### 3. Receipt Verification
- **Queue View**: List of receipts pending verification
- **Image Viewer**: Display receipt proof images
- **Actions**: Approve, reject, or flag as fraud
- **Bulk Verification**: Process multiple receipts at once
- **Fraud Detection**: Flag suspicious receipts

### 4. User Management
- **User List**: All registered users
- **User Actions**: Ban/unban, reset password, view history
- **Analytics**: Ideas submitted, receipts, upvotes per user
- **Search**: Find users by name or email

### 5. Mentor Matching
- **Available Mentors**: List of mentors with expertise
- **Ideas Needing Mentors**: Ideas that require mentorship
- **Match Interface**: Drag-and-drop or click-to-match
- **Success Metrics**: Track mentorship outcomes

### 6. Reports
- **Export Options**: Excel, CSV, PDF
- **Report Types**: Ideas, Users, Receipts, Funding Pipeline, Sector Analysis, Geographic Distribution
- **Date Ranges**: All time, 7 days, 30 days, 90 days, 1 year
- **Analytics Preview**: Quick stats before export

### 7. Settings
- **Scoring Weights**: Adjust weights for each scoring criterion
- **Thresholds**: Set minimum scores for clarity, decision, qualification tiers
- **SDG Configuration**: Enable/disable SDG tags
- **Sector Management**: Configure available sectors

### 8. Audit Log
- **Action Tracking**: All admin actions logged
- **Filters**: By action, admin, date range
- **Details**: Full context of each action
- **Compliance**: Full audit trail for accountability

## Authentication

### Login
- Access: `/admin/login`
- Credentials: Set via environment variables
  - `ADMIN_EMAIL`: Admin email address
  - `ADMIN_PASSWORD`: Admin password
- Session: 24-hour cookie-based session

### Security
- Role-based access control
- All actions logged in audit trail
- IP address tracking
- Session timeout

## API Endpoints

### Stats
- `GET /api/admin/stats` - Get overview statistics

### Ideas
- `GET /api/admin/ideas` - List all ideas with filters
- `POST /api/admin/ideas/bulk` - Bulk actions (approve/reject/flag)
- `POST /api/admin/ideas/[id]/score` - Override score

### Receipts
- `GET /api/admin/receipts` - List receipts (flagged or pending)
- `POST /api/admin/receipts/[id]/verify` - Verify/reject receipt
- `POST /api/admin/receipts/bulk-verify` - Bulk verify receipts

### Users
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/[id]/ban` - Ban/unban user
- `POST /api/admin/users/[id]/reset-password` - Reset user password

### Mentors
- `GET /api/admin/mentors` - List available mentors
- `POST /api/admin/mentors/match` - Match mentor to idea

### Reports
- `GET /api/admin/reports/export` - Export report (CSV/Excel/PDF)

### Settings
- `GET /api/admin/settings` - Get current settings
- `POST /api/admin/settings` - Update settings

### Audit
- `GET /api/admin/audit` - Get audit log with filters

## Database Schema

See `docs/admin-dashboard-schema.sql` for:
- `admin_audit_log` - All admin actions
- `mentor_matches` - Mentor-idea matches
- `idea_upvotes` - Upvote tracking
- `problem_validations` - Problem validation tracking

## Usage

1. **Access Dashboard**: Navigate to `/admin`
2. **Login**: Use admin credentials
3. **Navigate**: Use tabs to switch between sections
4. **Take Actions**: Use filters, search, and action buttons
5. **Monitor**: Check audit log for all actions

## Best Practices

1. **Always Review**: Check idea details before approving/rejecting
2. **Use Filters**: Narrow down lists before bulk actions
3. **Check Audit Log**: Review actions regularly
4. **Verify Receipts**: Carefully review receipt images
5. **Monitor Metrics**: Track stats to identify trends

## Environment Variables

```bash
ADMIN_EMAIL=admin@fikravalley.com
ADMIN_PASSWORD=secure_password_here
```

## Security Notes

- All admin actions are logged
- IP addresses are tracked
- Sessions expire after 24 hours
- Passwords should be strong and rotated regularly
- Consider implementing 2FA for production

