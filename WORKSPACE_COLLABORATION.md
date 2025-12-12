# Workspace Collaboration Feature

## Overview

Real-time collaborative workspaces that allow teams to work together on documents. This feature transforms Visura from a personal tool into a powerful team collaboration platform.

## Features

### 1. **Workspace Management**
- Create multiple workspaces
- Invite team members via email
- Role-based permissions (Owner, Admin, Member, Viewer)
- Workspace activity logs

### 2. **Document Sharing**
- Share documents with workspaces
- Permission levels: View, Comment, Edit
- Centralized document library per workspace

### 3. **Real-time Collaboration**
- Live presence indicators (who's viewing)
- Active collaborator tracking
- Real-time cursor positions (coming soon)
- Collaboration session management

### 4. **Comments & Annotations**
- Add comments to documents
- Threaded replies
- Position-based comments
- Resolve/unresolve comments

## Database Schema

Run `workspace_schema.sql` in your database to create the necessary tables:

```sql
-- Main tables
- workspaces
- workspace_members
- document_shares
- collaboration_sessions
- document_comments
- workspace_activities
```

## API Endpoints

### Workspaces
- `GET /api/workspaces` - List all workspaces for user
- `GET /api/workspaces?id={id}` - Get specific workspace
- `POST /api/workspaces` - Create new workspace

### Members
- `GET /api/workspaces/members?workspaceId={id}` - Get workspace members
- `POST /api/workspaces/members` - Invite member

### Documents
- `GET /api/workspaces/documents?workspaceId={id}` - Get shared documents
- `POST /api/workspaces/documents` - Share document with workspace

### Collaboration
- `GET /api/workspaces/collaboration?pdfSummaryId={id}` - Get active collaborators
- `POST /api/workspaces/collaboration` - Update collaboration session
- `DELETE /api/workspaces/collaboration?pdfSummaryId={id}` - Leave collaboration session

### Comments
- `GET /api/workspaces/comments?pdfSummaryId={id}` - Get document comments
- `POST /api/workspaces/comments` - Add comment

## UI Components

### Workspace Selector
Located in header, allows switching between workspaces.

### Workspaces Page
`/workspaces` - Main workspace management page
- Create new workspaces
- View all workspaces
- Manage members
- View shared documents

### Share Document Dialog
Adds "Share with Workspace" button to document actions.

### Collaboration Presence
Shows active collaborators viewing a document in real-time.

## Setup Instructions

1. **Run Database Migration**
   ```bash
   # Execute workspace_schema.sql in your database
   ```

2. **Access Workspaces**
   - Navigate to `/workspaces` to create your first workspace
   - Or use the workspace selector in the header

3. **Share Documents**
   - Open any document summary
   - Click "Share with Workspace" button
   - Select workspace and permission level

4. **Invite Team Members**
   - Go to workspace page
   - Click "Invite Member"
   - Enter email address
   - User must have an account (they'll be prompted to sign up)

## Real-time Updates

Currently uses polling (2-second intervals) for:
- Active collaborator presence
- Collaboration session updates

Future enhancements:
- WebSocket support for instant updates
- Live cursor positions
- Real-time comment notifications

## Permissions

### Owner
- Full control
- Delete workspace
- Manage all members
- Change member roles

### Admin
- Invite members
- Share documents
- Manage workspace settings

### Member
- View and comment on documents
- Share documents (if allowed)

### Viewer
- View documents only
- No editing or sharing

## Activity Logging

All workspace activities are logged:
- Workspace creation
- Member invitations
- Document sharing
- Comments added
- And more...

View activities in workspace details (coming soon).

## Future Enhancements

1. **Live Cursors**
   - Real-time cursor positions
   - Visual indicators on document

2. **Advanced Comments**
   - Rich text formatting
   - @mentions
   - Email notifications

3. **Document Versioning**
   - Track document changes
   - Version history
   - Rollback capabilities

4. **Workspace Templates**
   - Pre-configured workspaces
   - Industry-specific templates

5. **Integration APIs**
   - Webhook support
   - REST API for external integrations

## Troubleshooting

### Member Invitation Fails
- Ensure user has signed up (email must exist in users table)
- Check email is correct
- User may already be a member

### Documents Not Appearing
- Verify document was shared with workspace
- Check user has access to workspace
- Refresh workspace page

### Collaboration Not Working
- Check browser console for errors
- Verify API endpoints are accessible
- Ensure user is authenticated

## Support

For issues or questions, check:
- API response errors in browser console
- Database connection status
- User authentication status










