# Phase 5: Production Release

Phase 5 prepares SheetFlow for open-source release and production deployment. This phase focuses on build stability, deployment readiness, documentation, and verification.

## 🎯 Goals

- Ensure Next.js build is production-ready
- Provide clear environment configuration for both local and production
- Create a release checklist for open-source readiness
- Document the Phase 5 workflow and handoff requirements

## ✅ What Phase 5 Includes

- `next.config.js` is optimized for production with `reactStrictMode`, `swcMinify`, security headers, and `output: "standalone"`
- `.env.example` contains all required environment variables and production guidance
- `package.json` includes strict build scripts:
  - `npm run check` — run lint and type-check
  - `npm run build:strict` — run checks and build for production
- A production-ready deployment checklist that can be used before release

## 📦 Phase 5 Checklist

- [ ] Verify `npm install` completes without missing dependencies
- [ ] Run `npm run check` and fix any lint/type issues
- [ ] Run `npm run build:strict` and confirm build success
- [ ] Ensure `.env.example` covers required runtime variables
- [ ] Confirm `next.config.js` security headers and image config are correct
- [ ] Validate `README.md` and documentation references for Phase 5
- [ ] Prepare release notes and deployment instructions for the first public preview

## 🚀 Production Notes

- Use `npm run build:strict` before deploying to any production environment
- Set `NEXTAUTH_URL` to the public URL in production
- Store secrets securely in environment variables or secret manager

## 📘 Next Steps

Once Phase 5 is verified:

1. add deployment scaffolding for your chosen hosting platform
2. add CI checks and workflow automation in Phase 6
3. polish release documentation and open-source contribution guidance
