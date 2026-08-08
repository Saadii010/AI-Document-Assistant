# 🧠 AI Personal Knowledge Assistant

AI Personal Knowledge Assistant is a full-stack AI-powered knowledge management platform that allows users to store, organize, search, and interact with their personal knowledge through an intelligent web interface.

The platform has been extended with **enterprise workspace and collaboration capabilities**, allowing multiple users to securely work together within isolated workspaces while maintaining role-based permissions, shared knowledge, team conversations, activity tracking, and document version history.

## 🚀 Features

### 🔐 Authentication & Account Management

* JWT-based authentication
* User registration and login
* Password recovery and reset
* Protected application routes
* User profile management

### 📚 Knowledge Management

* Document upload and management
* Document search
* Favorites and bookmarks
* Storage tracking
* Document version history
* Version restoration
* Workspace-based document isolation

### 🤖 AI Assistant

* AI-powered conversations using Google Gemini
* Workspace-aware AI interactions
* Shared team conversations
* Conversation permissions
* Read-only conversations
* Pinned team conversations

### 🏢 Workspace Collaboration

* Create and manage workspaces
* Rename and delete workspaces
* Switch between workspaces
* Workspace ownership transfer
* Workspace member management
* Isolated workspace data

### 👥 Team Management

Supported roles include:

* Owner
* Admin
* Editor
* Viewer

Workspace administrators can:

* Invite members
* Remove members
* Change member roles
* Suspend members
* Manage workspace permissions

### ✉️ Invitations

* Email-based workspace invitations
* Accept invitations
* Decline invitations
* Resend invitations
* Invitation expiration handling

### 💬 Collaboration

* Shared conversations
* Document comments
* Comment replies
* Comment editing and deletion
* Comment resolution
* User mentions
* Pinned team discussions

### 📊 Activity & Auditing

The platform tracks important workspace activities including:

* Document uploads
* Document edits
* AI requests
* Comments
* Invitations
* Role changes
* Workspace updates
* Permission changes
* Administrative actions

Audit logs provide administrators with a history of important workspace operations.

### 🔒 Security & Permissions

* Workspace-level data isolation
* Role-based access control
* Granular permissions
* Protected workspace APIs
* Authorization checks on requests
* Prevention of unauthorized document access

### 🎨 User Experience

* Responsive web interface
* Dark and light themes
* Modern dashboard
* Workspace switcher
* Notifications
* Activity feed

---

# 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │        User         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ React + TypeScript  │
                         │     Frontend        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Express REST API  │
                         └──────────┬──────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
   Authentication            Workspace System           AI Services
          │                         │                         │
          │                  ┌──────┼──────┐                  │
          │                  │      │      │                  │
          │                  ▼      ▼      ▼                  ▼
          │               Members  Roles  Permissions    Gemini API
          │
          └─────────────────────────┬─────────────────────────┘
                                    │
                                    ▼
                           MongoDB Database
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
      Documents                Conversations             Activities
          │                         │                         │
          ▼                         ▼                         ▼
   Document Versions          Shared Chats              Audit Logs
```

---

# 🔄 Workspace Request Flow

```text
User
 │
 ▼
React Frontend
 │
 ▼
Workspace Context
 │
 ▼
Express API
 │
 ├── Authentication
 │
 ├── Workspace Validation
 │
 ├── Role & Permission Check
 │
 ├── Business Logic
 │
 ├── MongoDB
 │
 └── Gemini AI
 │
 ▼
Workspace-Isolated Response
```

---

# 🗂️ Project Structure

```text
AI-Personal-Knowledge-Assistant/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── routes/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── assets/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   └── utils/
│
├── uploads/
├── package.json
└── README.md
```

---

# 🧩 Workspace Data Models

The collaboration layer introduces dedicated models for:

* `Workspace`
* `WorkspaceMember`
* `Invitation`
* `Comment`
* `ActivityFeed`
* `AuditLog`
* `DocumentVersion`

Existing document and conversation models are also extended to support workspace-based collaboration.

---

# 🔑 Workspace Permissions

```text
Owner
 ├── Full Workspace Access
 ├── Member Management
 ├── Role Management
 └── Workspace Settings

Admin
 ├── Member Management
 ├── Workspace Management
 └── Activity & Audit Access

Editor
 ├── Upload Documents
 ├── Edit Documents
 ├── Comment
 └── AI Chat

Viewer
 ├── View Documents
 ├── Search Knowledge
 └── Read Conversations
```

---

# 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### AI

* Google Gemini API
* LangChain

### Security

* JWT
* bcrypt
* Role-Based Access Control
* Workspace-Level Authorization

---

# 🎯 Project Objective

The goal of the project is to provide a secure and intelligent knowledge management environment where individuals and teams can organize documents, collaborate within isolated workspaces, communicate with an AI assistant, and maintain complete visibility over workspace activities and changes.

The platform combines **AI-assisted knowledge management with enterprise collaboration, access control, auditing, and document versioning** to provide a scalable foundation for team-based knowledge sharing.
