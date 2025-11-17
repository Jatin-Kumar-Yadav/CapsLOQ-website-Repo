# CapsLOQ-website-Repo
CapsLOQ -| Full-Stack Custom Phone E-Commerce Platform. Features real-time price &amp; live preview with JWT login, MongoDB-synced cart, saved builds, past orders, category-filtered homepage, toast alerts &amp; cart badge. Built with pure HTML/CSS/JS + Node.js/Express/Mongoose. Production-ready, responsive, zero-framework e-commerce experience.


CapsLOQ is a **full-stack, production-ready custom smartphone e-commerce platform** that lets users design their perfect phone from scratch — exactly like Nothing Phone, Fairphone, or high-end PC builders (PCPartPicker, Origin PC).  
Built with pure passion and zero external UI frameworks, it proves you can create Amazon-level shopping experiences using only **vanilla HTML, CSS, JavaScript + Node.js**.

### Features

#### Phone Customizer (The Star Feature)
- Choose every component:
  - **Processor**: Snapdragon 8 Gen 3, 7s Gen 2, Dimensity 8300, etc.
  - **RAM & Storage** combos (up to 16 GB + 2 TB)
  - **Camera**: 64 MP Sony IMX, 108 MP, ultrawide, etc.
  - **Display**: 6.7″ AMOLED 120 Hz, LCD options
  - **Battery**: 4550–6900 mAh
  - **Color & Material**: Red Velvet, Midnight Black, Polycarbonate/Glass/Titanium
- Real-time live phone preview
- Dynamic pricing engine (base price + per-component cost)
- Instant spec panel updates
- “Save Configuration” + “Add to Cart” with session restore

#### Homepage & Pre-built Models
- Horizontal scrolling phone cards (Rivo, Aura, Magic, Margak, Galvin)
- Category filters: All • Flagship • Gaming • Budget • Business
- One-click “Add to Cart” with toast notifications

#### Full-Stack Authentication & Persistence
- Secure **JWT + bcrypt** login/register system
- MongoDB-backed cart (survives browser clear & works across devices)
- “Saved for Later” & “Past Purchases” sections
- Live cart badge counter (red number like Amazon)

#### UX Excellence
- Green toast notifications
- Session persistence (return to customizer → your build is exactly where you left it)
- Fully mobile-responsive design
- Pure CSS custom radio buttons & smooth animations

### Tech Stack
| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | HTML5, EJS templates, Vanilla JS (ES6+), CSS3 |
| Backend      | Node.js + Express                       |
| Database     | MongoDB + Mongoose                      |
| Auth         | JWT, bcryptjs                           |
| Hosting      | Ready for Vercel (frontend) + Railway/Render (backend) |

### Project Structure
CapsLOQ/
├── public/           → Static assets (images, CSS, JS)
├── views/            → EJS templates (customize.ejs, cart.html)
├── server.js         → Express server + routes
├── models/           → Mongoose schemas (User, Cart)
├── Customize.json    → Full customization config engine
├── Phones.json       → Pre-built phone catalog
└── .env              → Secrets (never pushed)


### Quick Start (Local)
```bash
git clone https://github.com/Jatin-Kumar-Yadav/CapsLOQ-website-Repo.git
cd CapsLOQ-website-Repo
npm install
npm run dev

You need to install all the required dependencies and can even download nodemon for the server so that you don't need to run the server again and again after changes


At the end this is only my first web dev project. Project created by JATIN KUMAR YADAV student of BML Munjal University, Gurugram, Haryana, India.
Thanks a lot



