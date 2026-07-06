const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

const PRODUCTS = [
    // ─── ELECTRONICS ──────────────────────────────────────────────────
    {
        name: "Spectra X-80 Keyboard",
        category: "Electronics",
        price: 189.00,
        rating: 4.8,
        reviewsCount: 142,
        image: "assets/keyboard.png",
        badge: "Best Seller",
        description: "A premium cyberpunk-aesthetic mechanical keyboard featuring custom hot-swappable tactile switches, frosted polycarbonate casing, and dual-zone neon underglow. Engineered with double-shot keycaps featuring futuristic glyphs.",
        specs: {
            "Switch Type": "Nebula Tactile (Hot-swappable)",
            "Interface": "USB-C / 2.4GHz Wireless",
            "Layout": "75% Compact Form Factor",
            "Keycaps": "Double-Shot Polycarbonate",
            "Lighting": "Dual-zone Addressable RGB Underglow"
        }
    },
    {
        name: "Iris HUD-1 AR Glasses",
        category: "Electronics",
        price: 499.00,
        rating: 4.9,
        reviewsCount: 78,
        image: "assets/glasses.png",
        badge: "New Release",
        description: "Augmented reality smart glasses designed to project high-fidelity cyber overlays into your view. Experience dual micro-LED engines, advanced eye-tracking navigation, and lightweight construction for comfortable all-day wear.",
        specs: {
            "Display Engine": "Dual Micro-LED (1000 nits peak)",
            "Resolution": "2K per eye with 90Hz refresh",
            "Controls": "Eye-tracking and touch gestures",
            "Connectivity": "Wi-Fi 6E / Bluetooth 5.2",
            "Weight": "76g Ultra-lightweight"
        }
    },
    {
        name: "Aether Ring-9 Headphones",
        category: "Electronics",
        price: 299.00,
        rating: 4.7,
        reviewsCount: 231,
        image: "assets/headphones.png",
        badge: "Staff Pick",
        description: "Next-generation active noise-canceling headphones powered by planar magnetic drivers. Features glowing sound-ring accents on the earcups and hybrid ANC to completely isolate your acoustic space.",
        specs: {
            "Driver Technology": "50mm Planar Magnetic",
            "ANC Depth": "Hybrid ANC (up to -42dB)",
            "Battery Life": "40 hours with lighting active",
            "Audio Codecs": "LDAC, aptX Adaptive, AAC",
            "Build": "Carbon-reinforced composite frame"
        }
    },
    {
        name: "Synapse Mouse-8",
        category: "Electronics",
        price: 129.00,
        rating: 4.8,
        reviewsCount: 94,
        image: "assets/mouse.png",
        badge: "Hot Item",
        description: "An ergonomic ultra-lightweight computer mouse with a translucent honeycomb shell. Features 26,000 DPI precision optical sensor and a neon-glowing interior circuit layout.",
        specs: {
            "Sensor Engine": "Pixart 3395 Optical",
            "DPI Range": "100–26,000 DPI",
            "Switch Lifespan": "80 Million Clicks",
            "Weight": "58g Ultra-light",
            "Battery": "80 hours wireless"
        }
    },
    {
        name: "Vortex Sound-1 Speaker",
        category: "Electronics",
        price: 349.00,
        rating: 4.9,
        reviewsCount: 56,
        image: "assets/speaker.png",
        badge: "Audiophile",
        description: "Premium glassmorphic wireless speaker with upward-firing acoustic transducers. Projects dynamic neon soundwave visualizers that reflect current bass frequencies in real-time.",
        specs: {
            "Amplifier": "60W RMS Class-D",
            "Pattern": "360-degree omnidirectional",
            "Frequency": "35Hz–22kHz",
            "Input": "AirPlay 2, Bluetooth 5.3, AUX",
            "Special Feature": "Neon Soundwave Projection"
        }
    },

    // ─── BOOKS ────────────────────────────────────────────────────────
    {
        name: "Neon Horizon: A Cyber Anthology",
        category: "Books",
        price: 24.99,
        rating: 4.7,
        reviewsCount: 318,
        image: "assets/Neon.png",
        placeholder: { icon: "book-open", color1: "#ffb700", color2: "#ff6b00", emoji: "📖", label: "Fiction" },
        badge: "Bestselling",
        description: "A curated collection of 18 short cyberpunk science fiction stories exploring artificial intelligence, urban dystopia, bio-hacking, and the relentless tension between human consciousness and machine intelligence.",
        specs: {
            "Genre": "Cyberpunk / Science Fiction",
            "Pages": "372 pages",
            "Authors": "Various — 18 international contributors",
            "Format": "Hardcover & eBook",
            "Publisher": "Aetheris Digital Press"
        }
    },
    {
        name: "The Golden Ratio: Designing by Nature",
        category: "Books",
        price: 45.00,
        rating: 4.9,
        reviewsCount: 189,
        image: "assets/golden.png",
        placeholder: { icon: "pen-tool", color1: "#00d4ff", color2: "#0055ff", emoji: "📐", label: "Design" },
        badge: "Educational",
        description: "A comprehensive design textbook tracing the application of the Golden Ratio (φ ≈ 1.618) across architecture, graphic layout, typography, digital UI/UX, and product form factor design. Includes 200+ annotated visual examples.",
        specs: {
            "Genre": "Design / Reference / Art",
            "Pages": "512 pages with full-color plates",
            "Authors": "Dr. Elara Voss & Magnus Ryūō",
            "Format": "Hardcover Premium Edition",
            "Includes": "Full-color mathematical diagrams"
        }
    },
    {
        name: "Quantum Code: Computing Mechanics",
        category: "Books",
        price: 59.99,
        rating: 4.8,
        reviewsCount: 102,
        image: "assets/Quantum.png",
        placeholder: { icon: "cpu", color1: "#00fff2", color2: "#0077ff", emoji: "⚛️", label: "Tech" },
        badge: "Expert Level",
        description: "A rigorous deep-dive into quantum computing theory and its practical programming applications. Covers qubit physics, quantum gate design, cryptographic implications, and real-world quantum algorithm implementation.",
        specs: {
            "Genre": "Computer Science / Academic",
            "Pages": "640 pages",
            "Authors": "Prof. Arjun Mehta, PhD",
            "Format": "Paperback & eBook",
            "Prerequisites": "Linear algebra, probability theory"
        }
    },
    {
        name: "UI/UX Beyond the Pixels",
        category: "Books",
        price: 34.99,
        rating: 4.6,
        reviewsCount: 244,
        image: "assets/uiux.png",
        placeholder: { icon: "layout-dashboard", color1: "#bd00ff", color2: "#ff00aa", emoji: "🎨", label: "UX" },
        badge: "Popular",
        description: "A practical masterclass in designing human-centered digital interfaces. Uses real case studies from mobile apps, enterprise dashboards, and e-commerce flows to demonstrate how every pixel maps to user emotion and decision flow.",
        specs: {
            "Genre": "UX Design / Technology",
            "Pages": "310 pages",
            "Authors": "Suki Tanaka",
            "Format": "Paperback with online assets",
            "Includes": "50 downloadable Figma templates"
        }
    },

    // ─── CLOTHES ──────────────────────────────────────────────────────
    {
        name: "Aether Shell-4 Techwear Jacket",
        category: "Clothes",
        price: 149.00,
        rating: 4.7,
        reviewsCount: 87,
        image: "assets/jacket.png",
        placeholder: { icon: "shield", color1: "#8888aa", color2: "#222244", emoji: "🧥", label: "Jacket" },
        badge: "New Drop",
        description: "A modular techwear jacket crafted from rip-stop nano-polymer fabric. Features magnetic seam closures, waterproof breathable shell membrane, internal cable-routing channels, and RFID-blocking interior chest pockets.",
        specs: {
            "Material": "5-layer nano-polymer rip-stop weave",
            "Fit": "Technical slim / modular layering",
            "Weather Rating": "20K MM hydrostatic waterproof",
            "Pockets": "8 internal + 4 external zip pockets",
            "Sizes": "XS, S, M, L, XL, XXL"
        }
    },
    {
        name: "Voxel Glide LED Sneakers",
        category: "Clothes",
        price: 199.00,
        rating: 4.6,
        reviewsCount: 143,
        image: "assets/sneaker.png",
        placeholder: { icon: "zap", color1: "#00fff2", color2: "#bd00ff", emoji: "👟", label: "Footwear" },
        badge: "Trending",
        description: "Next-gen lifestyle sneakers with programmable embedded LED sole strips and pressure-activated lighting effects. Built on an adaptive memory foam midsole and paired with a vegan leather upper.",
        specs: {
            "Upper Material": "Vegan micro-fiber leather",
            "Sole": "Adaptive memory foam cushion",
            "LED System": "Pressure-activated RGB sole strips",
            "Battery": "Rechargeable USB-C (72-hour run)",
            "Sizes": "EU 38–46 / US 6–13"
        }
    },
    {
        name: "Circuit Print Hoodie",
        category: "Clothes",
        price: 79.00,
        rating: 4.5,
        reviewsCount: 266,
        image: "assets/hodiee.png",
        placeholder: { icon: "radio", color1: "#00ff88", color2: "#005533", emoji: "👕", label: "Hoodie" },
        badge: "Fan Favorite",
        description: "A premium heavyweight cotton-blend hoodie with a glow-in-the-dark custom circuit board diagram screenprinted across the chest and sleeves. Includes a hidden earphone routing channel in the drawstring hood.",
        specs: {
            "Material": "80% cotton / 20% polyester fleece",
            "Print": "Photoluminescent glow-in-dark screenprint",
            "Fit": "Oversized / Drop-shoulder cut",
            "Features": "Hidden earphone channel, kangaroo pocket",
            "Sizes": "XS, S, M, L, XL, 2XL"
        }
    },

    // ─── OTHER ────────────────────────────────────────────────────────
    {
        name: "Nebula Ambient Sphere Lamp",
        category: "Other",
        price: 95.00,
        rating: 4.6,
        reviewsCount: 312,
        image: "assets/orb.png",
        badge: "Popular",
        description: "A gorgeous spherical desk lamp designed to paint your space in stunning organic light gradients. Syncs dynamically with surrounding audio or games, casting deep magenta, electric indigo, and sunset orange hues.",
        specs: {
            "Light Source": "Addressable RGB LED array",
            "Luminous Flux": "450 lumens peak brightness",
            "Controls": "App / Capacitive Touch",
            "Power": "USB-C 15W",
            "Chassis": "Frosted optical mineral glass"
        }
    },
    {
        name: "Nebula Wave Desk Mat",
        category: "Other",
        price: 59.00,
        rating: 4.7,
        reviewsCount: 188,
        image: "assets/deskmat.png",
        placeholder: { icon: "layout", color1: "#6600ff", color2: "#220077", emoji: "🖥️", label: "Accessory" },
        badge: "Desk Essential",
        description: "An oversized desktop protector mat lined with addressable neon light guides. Features a sleek dark topographical wave pattern that glows under keyboard lights, creating an organized, premium workspace.",
        specs: {
            "Dimensions": "900mm × 400mm × 4mm",
            "Surface": "Ultra-smooth low-friction synthetic fabric",
            "Edge Lighting": "USB-C dual-strip neon glow",
            "Backing": "Non-slip textured rubber base",
            "Pattern": "Laser-etched holographic topographic lines"
        }
    },
    {
        name: "Cyber Capsule Sticker Pack",
        category: "Other",
        price: 14.99,
        rating: 4.5,
        reviewsCount: 502,
        image: "assets/capsule.png",
        placeholder: { icon: "star", color1: "#ff007b", color2: "#aa0055", emoji: "🌟", label: "Stickers" },
        badge: "Budget Pick",
        description: "A curated collection of 64 high-quality vinyl holographic stickers inspired by cyberpunk and digital culture aesthetics. Includes circuit glyphs, neon icons, glitch-effect typography and space tech decals. Waterproof and fade-resistant.",
        specs: {
            "Quantity": "64 unique stickers per pack",
            "Material": "Premium cast vinyl with holographic laminate",
            "Durability": "UV-resistant, waterproof, scratch-proof",
            "Dimensions": "Sizes range from 3cm to 8cm",
            "Theme": "Cyberpunk / Sci-fi / Gaming"
        }
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // Clear existing products
        await Product.deleteMany({});
        console.log("Cleared existing products");

        // Insert new products
        const insertedProducts = await Product.insertMany(PRODUCTS);
        console.log(`${insertedProducts.length} products inserted successfully`);

        console.log("\nProducts with IDs:");
        insertedProducts.forEach(product => {
            console.log(`- ${product.name} (ID: ${product._id})`);
        });

        await mongoose.disconnect();
        console.log("\nDatabase seeding complete!");
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();
