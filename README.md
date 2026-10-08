<div align="center">

# 💼 Careerly

> AI Career Platform built with **React**, **TypeScript**, **Vite**, **Laravel**, **Tailwind CSS**, and **SQL**.

Careerly helps job seekers understand their skills, discover relevant opportunities, and organize their next career steps.

![React](https://img.shields.io/badge/React-19-149eca?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-13-f9322c?style=for-the-badge&logo=laravel&logoColor=white)
![Database](https://img.shields.io/badge/SQL-SQLite%20%7C%20MySQL-4479a1?style=for-the-badge&logo=mysql&logoColor=white)

</div>

---

## 🌐 Live Demo

**Coming soon.** The Vercel link will be added after the frontend, Laravel API, and database are deployed and connected.

---

## 📖 Overview

Careerly is a full-stack career workspace and portfolio project. It analyzes resume skills, compares them with job requirements, and helps users keep track of saved opportunities and applications.

The application includes a bilingual interface in Indonesian and English. Users can explore the dashboard in preview mode and create an account when they are ready to upload a resume. Each account has a private workspace and private resume storage.

---

## ✨ Features

- Resume upload for PDF and DOCX files up to 10 MB
- Resume skill extraction, editable skill profiles, score, summary, and improvement suggestions
- Job matching based on skills and career interests
- Job filters for remote, hybrid, and on-site roles, employment type, search, match threshold, and sorting
- Saved jobs and application status tracking
- User registration, login, logout, and password recovery
- Private workspaces and resume files for each account
- Profile, preferences, in-app notifications, and career development plans
- Daily job alerts and weekly career summaries when configured
- Resume history, workspace export to JSON, and retry for database synchronization
- Optional OpenAI analysis with explicit consent before resume text is sent
- Indonesian and English interface
- SQLite for local development and MySQL for deployment

---

## 🛠️ Tech Stack

| Technology | Description |
| --- | --- |
| React 19 | Frontend library |
| TypeScript 6 | Application language |
| Vite 8 | Frontend build tool and development server |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion | Interface animations |
| Lucide React | Icon library |
| Recharts | Dashboard charts |
| Laravel 13 | REST API and application backend |
| SQLite / MySQL | Relational data storage |
| Docker Compose / Nginx | Containerized deployment |

---

## 📂 Project Structure

```text
careerly-ai-career-platform/
├── backend/                 # Laravel API, database migrations, and private storage
├── deploy/                  # Docker, Nginx, and production environment example
├── public/                  # Static assets
├── scripts/                 # Local development launcher
├── src/                     # React application
│   └── App.tsx               # Career dashboard and API integration
├── Dockerfile.api
├── Dockerfile.web
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🚀 Installation

### Requirements

- Node.js and npm
- PHP 8.3 or later
- Composer
- PHP extensions: `pdo_sqlite`, `zip`, `xml`, `mbstring`, and `fileinfo`
- `pdo_mysql` when using MySQL

### Run locally

Clone the repository:

```bash
git clone https://github.com/AhmadTibyanHakim77/careerly-ai-career-platform.git
cd careerly-ai-career-platform
```

Install frontend dependencies and start the application:

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal. The development launcher prepares the Laravel API, creates local configuration, runs migrations and seeders, and starts the API, Vite, and scheduler. Press `Ctrl+C` in the terminal to stop the services.

SQLite is used by default. Local environment files and the database are created as needed and must not be committed. Use `npm run dev`; Live Server or VS Code's **Go Live** does not start the Laravel backend.

### Use MySQL

Create a MySQL database and update the database values in `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=careerly
DB_USERNAME=root
DB_PASSWORD=your-database-password
```

Restart the application after changing the configuration. Never commit `.env` files or database credentials.

---

## 🌍 Deployment

The repository includes Docker Compose configuration for the frontend, Laravel API, MySQL, queue worker, and scheduler. Public deployment requires a server or platform that supports Docker Compose, HTTPS, and persistent storage.

Careerly can also use Vercel for the Vite frontend. The Laravel API and SQL database must be hosted separately on a PHP-capable service. Configure a Vercel rewrite for `/api/*` to the deployed Laravel API so browser sessions continue to use the same site origin. The Vercel URL will be added here once the complete application is live.

For Docker deployment, copy `deploy/env.production.example` to `deploy/.env.production`, replace the example values, build the services, generate an application key, and start the stack:

```bash
cp deploy/env.production.example deploy/.env.production
# Edit deploy/.env.production and replace all example values
docker compose --env-file deploy/.env.production build
docker compose --env-file deploy/.env.production run --rm --no-deps --entrypoint php api artisan key:generate --show
```

Copy the generated key into `APP_KEY` in `deploy/.env.production`, then run:

```bash
docker compose --env-file deploy/.env.production up -d
docker compose --env-file deploy/.env.production ps
```

Set `APP_URL` to the production HTTPS URL, enable `SESSION_SECURE_COOKIE=true`, and use unique production secrets. SMTP is required for password recovery and email notifications. `OPENAI_API_KEY` is optional; rule-based scoring and skill matching work without it.

Back up both the database and the `careerly-resumes` volume. Database backups alone do not include uploaded resume files. Do not use `docker compose down -v` on a deployment containing data because it removes persistent volumes.

---

## 📸 Preview

Screenshots and the live demo link will be added after the complete application is deployed.

---

## 🔐 Privacy and Matching Notes

- Resume files are stored in Laravel's private storage and separated by account. Extracted resume text is used during analysis and is not stored as raw resume text in the application database.
- OpenAI analysis is disabled by default. Resume text is sent only when the user enables the integration and gives consent during upload. Third-party provider retention policies still apply.
- Job matching is an estimate based on skills and keywords. It is not a hiring decision and does not guarantee an interview or job offer.
- Live jobs are supplied by Arbeitnow and may be unavailable or focused on European and remote positions. Verify location, eligibility, and availability on the employer's application page.
- Locally seeded example jobs are labeled and are not verified vacancies.

---

## 👨‍💻 Developer

**Ahmad Tibyan Hakim**

GitHub: [AhmadTibyanHakim77](https://github.com/AhmadTibyanHakim77)

---

## 📄 License

This project is proprietary and distributed under **All Rights Reserved**. The source is available for portfolio review. Any use, copying, modification, publication, or distribution requires prior written permission from the copyright holder. See [`LICENSE`](LICENSE) for the full terms.

Public repositories can still be viewed and downloaded. To approve access before others can view the source, change the repository visibility to **Private** and invite only approved collaborators.
