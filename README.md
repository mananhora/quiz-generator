# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh



HOW TO RUN THE APP
1. RUN THE BACKEND APP
    cd backend
    source ../.venv/bin/activate  (activate the virtual environment)
   python app.py
   the app should now be running on http://localhost:5000.

2. RUN THE FRONTEND APP
     npm run dev

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Add environment variable in Vercel project settings:
    - `VITE_API_URL`: Your backend API URL

### Backend
Deploy your Flask backend to a hosting service (e.g., Heroku, DigitalOcean, etc.)
Make sure to:
1. Set environment variables:
    - `ANTHROPIC_API_KEY`
    - `FLASK_ENV=production`
2. Update CORS settings with your Vercel domain