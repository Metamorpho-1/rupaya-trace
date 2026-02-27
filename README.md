# 🧡 RupayaTrace: Real People. Real Help.
A radical manifesto for transparent giving.

> "The system is broken. We're fixing it."

In a world where charity often gets lost in transit, RupayaTrace was born to bridge the gap between the heart of the donor and the hands of the recipient. We believe that when you give, you deserve to see the story of your impact unfold in real-time.

## ✨ Features that Matter

**📱 Human-First Impact Reel**
We visualize impact through the stories of real people—like Aarav’s family in Odisha or Kavita in rural Bihar—so you can see exactly whose life you are changing.

**🛡️ The Ultimate Anti-Corruption Suite**
We verify every delivery with a strict 3-step protocol:
- **Aadhaar Anon-Checker:** Cryptographic verification of recipient existence without compromising privacy.
- **Bill Photo Scanner:** AI-powered receipt matching to ensure funds match actual expenses.
- **Geo-Proof Handoff:** Secure, geotagged photo verification of the final delivery.

**💸 Seamless UPI Integration**
Direct, secure, and familiar. Our integrated UPI checker ensures your contribution is safe from scan to delivery.

## 🛠️ Technical Implementation

**The Stack**
- **Frontend:** Next.js 16.1.6 (React 19) + Framer Motion.
- **Styling:** Tailwind CSS v4 + Lucide Icons.
- **Trust Layer:** Solidity Smart Contracts (Escrow Vaults) on Polygon.
- **Privacy:** ZK-inspired Aadhaar Verification (Anon-Aadhaar).

## 🏁 Step-by-Step Setup & Deployment Guide

### 1. Local Environment Setup
Open your terminal and run the following commands to get the pulse of the project started.

```bash
# Clone the heart of the project
git clone https://github.com/Metamorpho-1/rupaya-trace.git
cd rupaya-trace/frontend

# Install dependencies using the legacy-peer-deps flag to resolve React 19 conflicts
npm install --legacy-peer-deps

# Install missing CSS requirements
npm install autoprefixer --legacy-peer-deps

# Start the local development server
npm run dev
```

### 2. The Tunnel (Testing on Other Devices)
To view this on a phone or another laptop without a public deployment, use Ngrok.

```bash
# Install ngrok globally (use sudo on Mac if permissions are denied)
sudo npm install -g ngrok

# Authenticate your account (Get token from dashboard.ngrok.com)
ngrok config add-authtoken <YOUR_TOKEN>

# Start the tunnel on port 3000
ngrok http 3000
```

### 3. GitHub & Vercel Deployment
To move from local to live:

```bash
# Initialize and push to your repo
git init
git remote add origin https://github.com/your-username/rupaya-trace.git
git branch -M main
git add .
git commit -m "Final push: Verified Human Impact Protocol"
git push -u origin main
```

**Vercel Configuration:**
- **Build Command:** `next build --webpack` (Forces the stable engine to avoid NftJsonAsset errors).
- **Environment Variables:** Add `NEXT_DISABLE_TURBOPACK=1`.
- **Install Command:** `npm install --legacy-peer-deps`.

### 4. Google OAuth Whitelisting
To fix the "Invalid Google Token" error, navigate to Google Cloud Console:
- **Authorized JavaScript Origins:** Add your Vercel URL (e.g., `https://rupaya-trace.vercel.app`).
- **Authorized Redirect URIs:** Add the same URL (Ensure there is no trailing slash `/` at the end).

## 🤝 Meet the Contributors
RupayaTrace is built by a team of dreamers dedicated to radical transparency.

- **Lakshya Gupta** - Systems Integration
- **Manan Verma** - Smart Contract Wizard
- **Arihant Jain** - Backend Manager
- **Shivang Singhal** - UI/UX builder
