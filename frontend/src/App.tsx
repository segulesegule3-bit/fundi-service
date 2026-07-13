import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './admin/AdminDashboard';
import { OpsCenter } from './admin/OpsCenter';
import { 
  Zap, 
  Droplet, 
  Wrench, 
  Search, 
  MapPin, 
  Sliders, 
  ShieldCheck, 
  Star, 
  Send, 
  Bot, 
  Sun, 
  Moon, 
  CheckCircle, 
  FileText, 
  Sparkles,
  LogOut,
  Upload,
  Lock,
  Key,
  Shield,
  Phone,
  MessageSquare,
  Award,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Camera,
  Video,
  PhoneCall,
  MessageCircle,
  Mic,
  Paperclip,
  Smile,
  Compass,
  Filter,
  DollarSign,
  Briefcase,
  ThumbsUp,
  Map,
  X,
  FileDown,
  Info,
  Hammer,
  Brush,
  Car,
  Cpu,
  Wind,
  AlertCircle,
  Users,
  HelpCircle,
  Mail
} from 'lucide-react';

// MOCK DATA

// Category Definitions
// Reusable Primary Brand Button component
interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className = '', loading = false, ...props }) => {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 duration-200 ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
};

// Category Definitions
const MOCK_PROFESSIONS = [
  { id: '1', nameEn: 'Electrician', nameSw: 'Fundi Umeme', icon: Zap },
  { id: '2', nameEn: 'Plumber', nameSw: 'Fundi Mabomba', icon: Droplet },
  { id: '3', nameEn: 'AC Repair', nameSw: 'Fundi AC', icon: Wind },
  { id: '4', nameEn: 'Carpenter', nameSw: 'Fundi Mbao', icon: Hammer },
  { id: '5', nameEn: 'Mason', nameSw: 'Fundi Uashi', icon: Briefcase },
  { id: '6', nameEn: 'Painter', nameSw: 'Fundi Rangi', icon: Brush },
  { id: '7', nameEn: 'Welder', nameSw: 'Fundi Kuchomea', icon: Shield, image: '/fundi_welding.jpg' },
  { id: '8', nameEn: 'Mechanic', nameSw: 'Fundi Magari', icon: Car },
  { id: '9', nameEn: 'CCTV Installer', nameSw: 'Mfungaji wa CCTV', icon: Camera },
  { id: '10', nameEn: 'Computer Technician', nameSw: 'Fundi Kompyuta', icon: Cpu },
  { id: '11', nameEn: 'Solar Installer', nameSw: 'Fundi Umeme wa Jua', icon: Sun },
  { id: '12', nameEn: 'Aluminum Fabricator', nameSw: 'Fundi Aluminiamu', icon: Shield },
  { id: '13', nameEn: 'Steel Fabricator', nameSw: 'Fundi Chuma', icon: Shield },
  { id: '14', nameEn: 'Ceiling Installer', nameSw: 'Fundi Bodi za Dari', icon: Hammer },
  { id: '15', nameEn: 'Roofing Specialist', nameSw: 'Fundi Paa', icon: Briefcase },
  { id: '16', nameEn: 'Tiles Installer', nameSw: 'Fundi Vigae (Tiles)', icon: Hammer },
  { id: '17', nameEn: 'Gypsum Expert', nameSw: 'Fundi Gypsum', icon: Hammer },
  { id: '18', nameEn: 'Network Technician', nameSw: 'Fundi Mtandao', icon: Compass },
  { id: '19', nameEn: 'Laptop Repair', nameSw: 'Ukarabati wa Laptop', icon: Cpu },
  { id: '20', nameEn: 'Phone Repair', nameSw: 'Ukarabati wa Simu', icon: Cpu },
  { id: '21', nameEn: 'Printer Technician', nameSw: 'Fundi Printer', icon: Cpu },
  { id: '22', nameEn: 'Photocopier Technician', nameSw: 'Fundi Mashine ya Kutoa Nakala', icon: Cpu },
  { id: '23', nameEn: 'Air Conditioner Technician', nameSw: 'Fundi AC', icon: Wind },
  { id: '24', nameEn: 'Refrigerator Technician', nameSw: 'Fundi Jokofu (Frig)', icon: Wind },
  { id: '25', nameEn: 'Washing Machine Technician', nameSw: 'Fundi Mashine ya Kufua', icon: Wind },
  { id: '26', nameEn: 'TV Repair Technician', nameSw: 'Fundi TV', icon: Wind },
  { id: '27', nameEn: 'Solar Technician', nameSw: 'Fundi Umeme wa Jua (Solar)', icon: Sun },
  { id: '28', nameEn: 'Generator Technician', nameSw: 'Fundi Jenereta', icon: Zap },
  { id: '29', nameEn: 'Auto Electrician', nameSw: 'Fundi Umeme wa Magari', icon: Zap },
  { id: '30', nameEn: 'Motorcycle Mechanic', nameSw: 'Fundi Pikipiki', icon: Car },
  { id: '31', nameEn: 'Water Pump Technician', nameSw: 'Fundi Pampu ya Maji', icon: Droplet },
  { id: '32', nameEn: 'Borehole Technician', nameSw: 'Fundi Visima vya Maji', icon: Droplet },
  { id: '33', nameEn: 'Interior Designer', nameSw: 'Mbunifu wa Ndani (Interior)', icon: Brush },
  { id: '34', nameEn: 'Exterior Designer', nameSw: 'Mbunifu wa Nje (Exterior)', icon: Brush },
  { id: '35', nameEn: 'Furniture Maker', nameSw: 'Fundi Samani (Furniture)', icon: Hammer },
  { id: '36', nameEn: 'Glass Installer', nameSw: 'Fundi Vioo', icon: CheckCircle },
  { id: '37', nameEn: 'Locksmith', nameSw: 'Fundi Kufuli na Funguo', icon: Lock },
  { id: '38', nameEn: 'Cleaning Services', nameSw: 'Huduma za Usafi', icon: CheckCircle },
  { id: '39', nameEn: 'Pest Control', nameSw: 'Udhibiti wa Wadudu (Pest Control)', icon: CheckCircle },
  { id: '40', nameEn: 'Gardening', nameSw: 'Huduma za Bustani (Gardening)', icon: CheckCircle },
  { id: '41', nameEn: 'Security System Installer', nameSw: 'Mfungaji wa Mifumo ya Ulinzi', icon: ShieldCheck },
  { id: '42', nameEn: 'Internet Installation Technician', nameSw: 'Fundi Usakinishaji wa Mtandao', icon: Compass },
  { id: '43', nameEn: 'CCTV Monitoring Specialist', nameSw: 'Mtaalamu wa Ufuatiliaji CCTV', icon: Camera },
  { id: '44', nameEn: 'Home Automation Technician', nameSw: 'Fundi Mifumo ya Kiotomatiki ya Nyumbani', icon: Cpu },
  { id: '45', nameEn: 'Fire Alarm Technician', nameSw: 'Fundi Kingameta cha Moto (Fire Alarm)', icon: ShieldCheck },
];

const getProfessionPricingModel = (id: string, nameEn: string) => {
  const models: Record<string, any> = {
    '1': {
      commonServices: [
        { name: 'House Wiring (Ufungaji Umeme)', price: 450000 },
        { name: 'Fixing Circuit Breaker (Kurekebisha Breaker)', price: 35000 },
        { name: 'Socket Repair (Kurekebisha Soketi)', price: 15000 }
      ],
      priceRange: 'TZS 15,000 - 650,000',
      inspectionFee: 15000,
      avgCompletionTime: '2 - 6 Hours',
      requiredSkills: ['Wiring', 'Troubleshooting', 'Conduit Laying'],
      toolsRequired: ['Multimeter', 'Wire Strippers', 'Screwdrivers', 'Pliers'],
      warrantyRecommendation: '60 Days'
    },
    '2': {
      commonServices: [
        { name: 'Leaking Pipe Repair (Kuziba Bomba)', price: 25000 },
        { name: 'Toilet Installation (Kufunga Choo Kipya)', price: 150000 },
        { name: 'Sink Unclogging (Kuzibua Sinki)', price: 20000 }
      ],
      priceRange: 'TZS 20,000 - 250,000',
      inspectionFee: 10000,
      avgCompletionTime: '1 - 3 Hours',
      requiredSkills: ['Pipe Threading', 'Leak Detection', 'Drain Unclogging'],
      toolsRequired: ['Pipe Wrench', 'Plunger', 'Teflon Tape', 'Hacksaw'],
      warrantyRecommendation: '30 Days'
    },
    '3': {
      commonServices: [
        { name: 'AC Gas Refill (Kujaza Gesi)', price: 75000 },
        { name: 'Compressor Replacement (Compressor mpya)', price: 250000 },
        { name: 'Filter Cleaning (Kusafisha Filter)', price: 25000 }
      ],
      priceRange: 'TZS 25,000 - 350,000',
      inspectionFee: 20000,
      avgCompletionTime: '2 - 4 Hours',
      requiredSkills: ['Refrigerant Handling', 'Electrical Safety', 'Leak Testing'],
      toolsRequired: ['Manifold Gauge', 'Vacuum Pump', 'Leak Detector', 'Screwdriver'],
      warrantyRecommendation: '90 Days'
    }
  };

  if (models[id]) return models[id];

  return {
    commonServices: [
      { name: `Basic ${nameEn} Service`, price: 35000 },
      { name: `Standard ${nameEn} Installation`, price: 120000 },
      { name: `Emergency ${nameEn} Repair`, price: 75000 }
    ],
    priceRange: 'TZS 25,000 - 450,000',
    inspectionFee: 15000,
    avgCompletionTime: '2 - 5 Hours',
    requiredSkills: [`Professional ${nameEn}`, 'Safety Protocols', 'Quality Finishing'],
    toolsRequired: ['Professional Toolkit', 'Safety Gloves', 'Power Tools'],
    warrantyRecommendation: '30 Days'
  };
};



// --- ENRICHED SERVICES DATA GENERATOR ---
const getProfessionDetails = (id: string, nameEn: string, nameSw: string) => {
  const model = getProfessionPricingModel(id, nameEn);
  
  const images: Record<string, { image: string, banner: string }> = {
    '1': {
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
      banner: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200'
    },
    '2': {
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600',
      banner: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200'
    },
    '3': {
      image: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=600',
      banner: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=1200'
    },
    '4': {
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600',
      banner: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1200'
    },
    '5': {
      image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600',
      banner: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=1200'
    },
    '6': {
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600',
      banner: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=1200'
    },
    '7': {
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600',
      banner: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1200'
    },
    '8': {
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600',
      banner: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=1200'
    },
    '9': {
      image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=600',
      banner: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1200'
    },
    '10': {
      image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=600',
      banner: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=1200'
    },
    '11': {
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=600',
      banner: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1200'
    }
  };

  const defaultImg = {
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=1200'
  };

  const img = images[id] || defaultImg;

  return {
    ...model,
    id,
    nameEn,
    nameSw,
    image: img.image,
    banner: img.banner,
    description: `Professional ${nameEn} services for residential and commercial customers. Our certified experts deliver high quality solutions for all your ${nameEn.toLowerCase()} needs with standard security protocols.`,
    descriptionSw: `Huduma za kitaalamu za ${nameSw} kwa wateja wa majumbani na maofisini. Wataalamu wetu waliohitimu wanatoa suluhisho bora kwa mahitaji yako yote ya ${nameSw.toLowerCase()} wakiwa na usalama wa kiwango cha juu.`,
    commonProblems: [
      `Emergency repairs and troubleshooting for ${nameEn.toLowerCase()}`,
      `New installations and hardware setups`,
      `Routine maintenance and safety checkups`
    ],
    commonProblemsSw: [
      `Matengenezo ya dharura na utatuzi wa matatizo ya ${nameSw.toLowerCase()}`,
      `Usakinishaji mpya na usanidi wa vifaa`,
      `Ufanyaji matengenezo wa mara kwa mara na ukaguzi wa usalama`
    ],
    faqs: [
      {
        q: `What is the starting price for ${nameEn.toLowerCase()} work?`,
        qSw: `Je, bei ya kuanzia kwa kazi za ${nameSw.toLowerCase()} ni kiasi gani?`,
        a: `The starting price is around ${model.priceRange.split(' - ')[0]} depending on the specific job requirements.`,
        aSw: `Bei ya kuanzia ni karibu ${model.priceRange.split(' - ')[0]} kulingana na mahitaji maalum ya kazi.`
      },
      {
        q: `Is there any warranty offered for the work?`,
        qSw: `Je, kuna dhamana (warranty) yoyote inayotolewa kwa kazi hiyo?`,
        a: `Yes, we recommend a standard warranty period of ${model.warrantyRecommendation} for this service.`,
        aSw: `Ndiyo, tunapendekeza kipindi cha dhamana cha ${model.warrantyRecommendation} kwa huduma hii.`
      }
    ],
    reviews: [
      {
        name: 'Amina S.',
        rating: 5,
        text: `Kazi nzuri sana na ya haraka! Fundi alikuwa mstaarabu na alimaliza kwa wakati.`,
        date: '2026-06-15'
      },
      {
        name: 'John M.',
        rating: 4.8,
        text: `Nimefurahishwa sana na huduma yao. Wanajua vizuri kazi yao na bei zao ni za kuridhisha.`,
        date: '2026-06-10'
      }
    ],
    relatedServices: ['1', '2', '3', '4', '8', '11'].filter(rid => rid !== id).slice(0, 3)
  };
};

// Initial Portfolios for mock data
const INITIAL_PORTFOLIOS = [
  {
    id: 'p1',
    fundiId: 'f1',
    title: 'Ufungaji Mpya wa Mabomba ya Choo',
    description: 'Nilikamilisha ufungaji kamili wa mfumo wa maji na mabomba ya choo kwenye nyumba mpya ya ghorofa moja Mikocheni.',
    beforeImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
    afterImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600',
    videoUrl: '',
    completionDate: '2026-05-12',
    clientApproved: true,
    serviceCategory: 'Plumber',
    location: 'Mikocheni B, Dar es Salaam'
  },
  {
    id: 'p2',
    fundiId: 'f1',
    title: 'Kurekebisha Mfumo Mkuu wa Maji taka',
    description: 'Mabomba ya zamani yalikuwa yameziba na kuvuja. Nilibadilisha kwa PVC mpya na kuweka chemba safi ya majitaka.',
    beforeImage: 'https://images.unsplash.com/photo-1542013936693-8848e57423e3?auto=format&fit=crop&q=80&w=600',
    afterImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    completionDate: '2026-06-01',
    clientApproved: true,
    serviceCategory: 'Plumber',
    location: 'Oysterbay, Dar es Salaam'
  },
  {
    id: 'p3',
    fundiId: 'f2',
    title: 'Ufungaji wa Solar Power System',
    description: 'Ufungaji wa solar panel 4 za 300W, inverter ya 3kVA na betri za lithium kwenye nyumba ya makazi Sinza.',
    beforeImage: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=600',
    afterImage: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600',
    videoUrl: '',
    completionDate: '2026-06-20',
    clientApproved: true,
    serviceCategory: 'Electrician',
    location: 'Sinza C, Dar es Salaam'
  }
];

// Initial Reviews for mock data
const INITIAL_REVIEWS = [
  {
    id: 'r1',
    bookingId: 'B-0089',
    customerId: 'c_01',
    customerName: 'Amina Selemani',
    customerPicture: '',
    fundiId: 'f1',
    rating: 5,
    comment: 'Kazi nzuri sana! Juma alifika kwa wakati na alirekebisha mabomba yote kwa ufanisi. Slider ya Before & After inaonyesha jinsi kazi ilivyokuwa safi!',
    beforePhotosUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'],
    afterPhotosUrls: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600'],
    projectCost: 25000,
    completionDate: '2026-06-29',
    isFake: false,
    fakeProbability: 0.00
  },
  {
    id: 'r2',
    bookingId: 'B-0077',
    customerId: 'c_02',
    customerName: 'Hamisi Omari',
    customerPicture: '',
    fundiId: 'f2',
    rating: 4,
    comment: 'Wiring ya nyumba ilifanywa kwa weledi mkubwa sana. Nilifurahishwa na mfumo wa solar aliotufungia.',
    beforePhotosUrls: ['https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=600'],
    afterPhotosUrls: ['https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600'],
    projectCost: 150000,
    completionDate: '2026-06-22',
    isFake: false,
    fakeProbability: 0.00
  }
];

const INITIAL_FUNDIS = [
  {
    id: 'f1',
    fullName: 'Juma Shabaan',
    profession: 'Plumber',
    rating: 4.9,
    reviewsCount: 52,
    jobsCompleted: 88,
    responseTime: 12,
    verified: true,
    online: true,
    price: 15000,
    location: 'Mikocheni A, Dar es Salaam',
    bio: 'Mafundi bomba mwenye cheti cha VETA. Nina uzoefu wa miaka 8 kwenye mifumo ya maji safi na maji taka.',
    skills: ['Leak Detection', 'Piping Layouts', 'Water Pump Repairs', 'Bathroom Installation'],
    subscription: 'premium',
    verificationStatus: 'verified',
    nationalId: '19900812-11105-00002-25',
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    ward: 'Mikocheni',
    street: 'Mikocheni A',
    latitude: -6.7794,
    longitude: 39.2605,
    serviceWarranty: '90 Days',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHoursStart: '08:00',
    workingHoursEnd: '18:00',
    emergencyAvailability: true,
    onSiteService: true,
    remoteService: false,
    phoneVerified: true,
    emailVerified: true,
    faceVerified: true,
    certificateVerified: true,
    idVerified: true
  },
  {
    id: 'f2',
    fullName: 'Baraka Joseph',
    profession: 'Electrician',
    rating: 4.8,
    reviewsCount: 37,
    jobsCompleted: 54,
    responseTime: 8,
    verified: true,
    online: false,
    price: 20000,
    location: 'Sinza A, Dar es Salaam',
    bio: 'Mtaalamu wa domestic wiring, solar panels, na matengenezo ya short circuits.',
    skills: ['House Wiring', 'Solar Installation', 'Breaker Box Repair', 'Fault Finding'],
    subscription: 'gold',
    verificationStatus: 'verified',
    nationalId: '19920415-11105-00001-14',
    region: 'Dar es Salaam',
    district: 'Ubungo',
    ward: 'Sinza',
    street: 'Sinza A',
    latitude: -6.7915,
    longitude: 39.2382,
    serviceWarranty: '6 Months',
    workingDays: [1, 2, 3, 4, 5],
    workingHoursStart: '08:00',
    workingHoursEnd: '17:00',
    emergencyAvailability: false,
    onSiteService: true,
    remoteService: false,
    phoneVerified: true,
    emailVerified: true,
    faceVerified: true,
    certificateVerified: true,
    idVerified: true
  },
  {
    id: 'f3',
    fullName: 'Amani Lucas',
    profession: 'Electrician',
    rating: 4.5,
    reviewsCount: 12,
    jobsCompleted: 19,
    responseTime: 20,
    verified: false,
    online: true,
    price: 12000,
    location: 'Kariakoo, Dar es Salaam',
    bio: 'Kazi zote za umeme wa majumbani na maofisini kwa bei nafuu.',
    skills: ['House Wiring', 'Breaker Replacement'],
    subscription: 'free',
    verificationStatus: 'pending_verification',
    nationalId: '19940718-11105-00003-88',
    region: 'Dar es Salaam',
    district: 'Ilala',
    ward: 'Kariakoo',
    street: 'Msimbazi St',
    latitude: -6.8210,
    longitude: 39.2745,
    serviceWarranty: '30 Days',
    workingDays: [1, 2, 3, 4, 5, 6, 7],
    workingHoursStart: '07:00',
    workingHoursEnd: '21:00',
    emergencyAvailability: true,
    onSiteService: true,
    remoteService: false,
    phoneVerified: true,
    emailVerified: false,
    faceVerified: false,
    certificateVerified: false,
    idVerified: false
  },
  {
    id: 'f4',
    fullName: 'Hamisi Salim',
    profession: 'AC Repair',
    rating: 4.7,
    reviewsCount: 18,
    jobsCompleted: 29,
    responseTime: 15,
    verified: true,
    online: true,
    price: 15000,
    location: 'Oysterbay, Dar es Salaam',
    bio: 'Mtaalamu wa matengenezo ya AC za majumbani na maofisini. Cleaning, gas refill, na compressor fixes.',
    skills: ['AC Cleaning', 'Gas Refilling', 'Compressor Repair', 'Duct Installation'],
    subscription: 'silver',
    verificationStatus: 'verified',
    nationalId: '19891012-11105-00004-95',
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    ward: 'Oysterbay',
    street: 'Haile Selassie Rd',
    latitude: -6.7690,
    longitude: 39.2790,
    serviceWarranty: '90 Days',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHoursStart: '08:00',
    workingHoursEnd: '18:00',
    emergencyAvailability: true,
    onSiteService: true,
    remoteService: false,
    phoneVerified: true,
    emailVerified: true,
    faceVerified: true,
    certificateVerified: true,
    idVerified: true
  },
  {
    id: 'f5',
    fullName: 'Elias John',
    profession: 'Carpenter',
    rating: 4.7,
    reviewsCount: 15,
    jobsCompleted: 30,
    responseTime: 15,
    verified: true,
    online: true,
    price: 10000,
    location: 'Mwenge, Dar es Salaam',
    bio: 'Mtaalamu wa kutengeneza samani za ndani na nje. Vitanda, makabati ya jikoni, na milango ya mbao.',
    skills: ['Cabinet Making', 'Door Fitting', 'Furniture Repair', 'Wood Polishing'],
    subscription: 'silver',
    verificationStatus: 'verified',
    nationalId: '19880520-11105-00004-92',
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    ward: 'Mwenge',
    street: 'Mpakani Rd',
    latitude: -6.7725,
    longitude: 39.2310,
    serviceWarranty: '60 Days',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHoursStart: '08:00',
    workingHoursEnd: '18:00',
    emergencyAvailability: false,
    onSiteService: true,
    remoteService: false,
    phoneVerified: true,
    emailVerified: true,
    faceVerified: true,
    certificateVerified: true,
    idVerified: true
  },
  {
    id: 'f6',
    fullName: 'Said Ally',
    profession: 'Mason',
    rating: 4.6,
    reviewsCount: 22,
    jobsCompleted: 40,
    responseTime: 18,
    verified: true,
    online: true,
    price: 12000,
    location: 'Temeke, Dar es Salaam',
    bio: 'Ujenzi wa nyumba kuanzia msingi hadi kuezeka, plastering, kuweka tiles, na ujenzi wa fence.',
    skills: ['Bricklaying', 'Plastering', 'Tiling', 'Foundation Work'],
    subscription: 'free',
    verificationStatus: 'verified',
    nationalId: '19850912-11105-00005-51',
    region: 'Dar es Salaam',
    district: 'Temeke',
    ward: 'Temeke',
    street: 'Wailes',
    latitude: -6.8480,
    longitude: 39.2680,
    serviceWarranty: '120 Days',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHoursStart: '07:30',
    workingHoursEnd: '17:30',
    emergencyAvailability: false,
    onSiteService: true,
    remoteService: false,
    phoneVerified: true,
    emailVerified: false,
    faceVerified: true,
    certificateVerified: false,
    idVerified: true
  },
  {
    id: 'f7',
    fullName: 'Maria Joseph',
    profession: 'Painter',
    rating: 4.9,
    reviewsCount: 18,
    jobsCompleted: 25,
    responseTime: 10,
    verified: true,
    online: true,
    price: 8000,
    location: 'Upanga, Dar es Salaam',
    bio: 'Mtaalamu wa kupaka rangi za ndani na nje, kuweka wallpaper, na wall decorations.',
    skills: ['Wall Painting', 'Wallpaper Installation', 'Color Matching', 'Exterior Spraying'],
    subscription: 'gold',
    verificationStatus: 'verified',
    nationalId: '19951102-11105-00006-74',
    region: 'Dar es Salaam',
    district: 'Ilala',
    ward: 'Upanga',
    street: 'Upanga West',
    latitude: -6.8090,
    longitude: 39.2810,
    serviceWarranty: '180 Days',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHoursStart: '08:00',
    workingHoursEnd: '17:00',
    emergencyAvailability: false,
    onSiteService: true,
    remoteService: false,
    phoneVerified: true,
    emailVerified: true,
    faceVerified: true,
    certificateVerified: true,
    idVerified: true
  },
  {
    id: 'f8',
    fullName: 'Frank Michael',
    profession: 'Welder',
    rating: 4.8,
    reviewsCount: 29,
    jobsCompleted: 50,
    responseTime: 14,
    verified: true,
    online: false,
    price: 15000,
    location: 'Sinza C, Dar es Salaam',
    bio: 'Kuchomea mageti, madirisha ya chuma, vitanda vya chuma na matengenezo yote ya chuma.',
    skills: ['Arc Welding', 'Gate Fabrication', 'Grills and Windows', 'Structural Steel'],
    subscription: 'premium',
    verificationStatus: 'verified',
    nationalId: '19910325-11105-00007-33',
    region: 'Dar es Salaam',
    district: 'Ubungo',
    ward: 'Sinza',
    street: 'Sinza C',
    latitude: -6.7932,
    longitude: 39.2325,
    serviceWarranty: '90 Days',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHoursStart: '08:00',
    workingHoursEnd: '18:00',
    emergencyAvailability: true,
    onSiteService: true,
    remoteService: false,
    phoneVerified: true,
    emailVerified: true,
    faceVerified: true,
    certificateVerified: true,
    idVerified: true
  },
  {
    id: 'f9',
    fullName: 'Kassim Ramadhani',
    profession: 'Mechanic',
    rating: 4.7,
    reviewsCount: 64,
    jobsCompleted: 110,
    responseTime: 15,
    verified: true,
    online: true,
    price: 25000,
    location: 'Kariakoo, Dar es Salaam',
    bio: 'Matengenezo ya magari ya Japani na Ulaya. Engine overhaul, suspension, na auto-electrical troubleshooting.',
    skills: ['Engine Repair', 'Brake Systems', 'Computer Diagnostics', 'Suspension Work'],
    subscription: 'premium',
    verificationStatus: 'verified',
    nationalId: '19870104-11105-00008-11',
    region: 'Dar es Salaam',
    district: 'Ilala',
    ward: 'Kariakoo',
    street: 'Msimbazi St',
    latitude: -6.8235,
    longitude: 39.2710,
    serviceWarranty: '30 Days',
    workingDays: [1, 2, 3, 4, 5, 6, 7],
    workingHoursStart: '08:00',
    workingHoursEnd: '20:00',
    emergencyAvailability: true,
    onSiteService: true,
    remoteService: false,
    phoneVerified: true,
    emailVerified: true,
    faceVerified: true,
    certificateVerified: true,
    idVerified: true
  },
  {
    id: 'f10',
    fullName: 'Neema Christopher',
    profession: 'CCTV Installer',
    rating: 4.8,
    reviewsCount: 16,
    jobsCompleted: 24,
    responseTime: 9,
    verified: true,
    online: true,
    price: 18000,
    location: 'Mikocheni B, Dar es Salaam',
    bio: 'Ufungaji wa mifumo ya CCTV, Access Control, na Intercom kwa ajili ya usalama wa nyumba na ofisi.',
    skills: ['Camera Mounting', 'NVR/DVR Configuration', 'IP Cameras', 'Remote Viewing Setup'],
    subscription: 'silver',
    verificationStatus: 'verified',
    nationalId: '19930814-11105-00009-44',
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    ward: 'Mikocheni',
    street: 'Mikocheni B',
    latitude: -6.7760,
    longitude: 39.2635,
    serviceWarranty: '180 Days',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHoursStart: '08:00',
    workingHoursEnd: '17:00',
    emergencyAvailability: true,
    onSiteService: true,
    remoteService: false,
    phoneVerified: true,
    emailVerified: true,
    faceVerified: true,
    certificateVerified: true,
    idVerified: true
  },
  {
    id: 'f11',
    fullName: 'Kelvin Massawe',
    profession: 'Computer & Laptop',
    rating: 4.6,
    reviewsCount: 33,
    jobsCompleted: 58,
    responseTime: 11,
    verified: true,
    online: true,
    price: 15000,
    location: 'Mwenge, Dar es Salaam',
    bio: 'Mtaalamu wa matengenezo ya laptop, computer za mezani, na mitandao (LAN/Wi-Fi). Apple na Windows.',
    skills: ['OS Installation', 'Hardware Repair', 'Motherboard Board-level Repair', 'Wi-Fi Setup'],
    subscription: 'gold',
    verificationStatus: 'verified',
    nationalId: '19940228-11105-00010-66',
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    ward: 'Mwenge',
    street: 'Mlalakuwa',
    latitude: -6.7705,
    longitude: 39.2270,
    serviceWarranty: '30 Days',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHoursStart: '08:30',
    workingHoursEnd: '18:00',
    emergencyAvailability: true,
    onSiteService: true,
    remoteService: true,
    phoneVerified: true,
    emailVerified: true,
    faceVerified: true,
    certificateVerified: true,
    idVerified: true
  },
  {
    id: 'f12',
    fullName: 'Yusuph Shabani',
    profession: 'Solar Installer',
    rating: 4.9,
    reviewsCount: 20,
    jobsCompleted: 31,
    responseTime: 12,
    verified: true,
    online: true,
    price: 22000,
    location: 'Sinza A, Dar es Salaam',
    bio: 'Ufungaji na matengenezo ya mifumo ya umeme wa jua (solar power systems). Betri, inverters, na panels.',
    skills: ['Solar Sizing', 'Inverter Programming', 'Battery Bank Setup', 'Solar Water Heaters'],
    subscription: 'premium',
    verificationStatus: 'verified',
    nationalId: '19890715-11105-00011-22',
    region: 'Dar es Salaam',
    district: 'Ubungo',
    ward: 'Sinza',
    street: 'Sinza A',
    latitude: -6.7905,
    longitude: 39.2395,
    serviceWarranty: '365 Days',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHoursStart: '08:00',
    workingHoursEnd: '17:30',
    emergencyAvailability: true,
    onSiteService: true,
    remoteService: false,
    phoneVerified: true,
    emailVerified: true,
    faceVerified: true,
    certificateVerified: true,
    idVerified: true
  }
];

const TRANSLATIONS = {
  sw: {
    home: "Nyumbani",
    estimator: "Kikadiria Bei (Estimator)",
    interactiveMap: "Ramani na Kutafuta",
    downloadApp: "Pakua App",
    aboutUs: "Kuhusu Sisi",
    login: "Ingia (Login)",
    becomeFundi: "Kuwa Fundi Wetu",
    welcome: "Karibu",
    notification: "Taarifa",
    logout: "Ondoka",
    contactUs: "Wasiliana Nasi",
    services: "Huduma",
    pricing: "Bei",
    settings: "Mipangilio",
    disputes: "Migogoro",
    users: "Watumiaji",
    activeFundis: "Mafundi Walio Hai",
    completedJobs: "Kazi Zilizokamilika"
  },
  en: {
    home: "Home",
    estimator: "Price Estimator",
    interactiveMap: "Interactive Map & Search",
    downloadApp: "Download App",
    aboutUs: "About Us",
    login: "Login",
    becomeFundi: "Become a Fundi",
    welcome: "Welcome",
    notification: "Notifications",
    logout: "Logout",
    contactUs: "Contact Us",
    services: "Services",
    pricing: "Pricing",
    settings: "System Settings",
    disputes: "Disputes",
    users: "Users Management",
    activeFundis: "Active Fundis",
    completedJobs: "Completed Jobs"
  }
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'sw' | 'en'>(() => (localStorage.getItem('preferredLang') as any) || 'sw');

  const t = (key: keyof typeof TRANSLATIONS.sw) => {
    return TRANSLATIONS[language][key] || key;
  };

  const toggleLanguage = () => {
    const newLang = language === 'sw' ? 'en' : 'sw';
    setLanguage(newLang);
    localStorage.setItem('preferredLang', newLang);
    showNotification(newLang === 'sw' ? 'Lugha imebadilishwa kuwa Kiswahili.' : 'Language changed to English.');
  };
  
  // Custom router state
  const [currentPath, setCurrentPath] = useState<'home' | 'about' | 'services' | 'become-fundi' | 'find-fundi' | 'contact' | 'download' | 'login' | 'register' | 'admin-login' | 'fundi-login' | 'super-admin-login' | 'dashboard' | 'ops-center'>('home');
  const [currentUser, setCurrentUser] = useState<any>(null); // { id, fullName, role, ... }
  
  // App lists state
  const [fundis, setFundis] = useState<any[]>(() => INITIAL_FUNDIS.map(f => ({ ...f, professions: [f.profession] })));
  const [portfolios, setPortfolios] = useState<any[]>(INITIAL_PORTFOLIOS);
  const [reviews, setReviews] = useState<any[]>(INITIAL_REVIEWS);
  
  // Premium Marketplace States
  const [selectedService, setSelectedService] = useState<any>(null);
  const [marketplaceViewMode, setMarketplaceViewMode] = useState<'list' | 'map'>('list');
  const [mQuery, setMQuery] = useState('');
  const [mRegion, setMRegion] = useState('');
  const [mDistrict, setMDistrict] = useState('');
  const [mRating, setMRating] = useState(0);
  const [mVerifiedOnly, setMVerifiedOnly] = useState(false);
  const [mEmergencyOnly, setMEmergencyOnly] = useState(false);
  const [mDistance, setMDistance] = useState(50); // radius in KM
  const [mExperience, setMExperience] = useState(0); // years
  const [mLanguage, setMLanguage] = useState('');
  const [mWarrantyOnly, setMWarrantyOnly] = useState(false);
  const [mPriceMin, setMPriceMin] = useState(0);
  const [mPriceMax, setMPriceMax] = useState(1000000);

const [searchProfession, setSearchProfession] = useState('2');
  
  // Booking state
  const [bookings, setBookings] = useState<any[]>([
    {
      id: 'B-0089',
      fundi: INITIAL_FUNDIS[0],
      customer: 'Amina Selemani',
      customerId: 'c_01',
      date: '2026-06-29',
      time: '10:00 AM',
      address: 'Mikocheni B, Block 4',
      description: 'Water pump leaks and low pressure.',
      price: 25000,
      status: 'PRICE_CONFIRMED',
      dispute: false
    }
  ]);

  // Request a Quote & Bids state
  const [quoteRequests, setQuoteRequests] = useState<any[]>([
    {
      id: 'QR-001',
      customerId: 'c_01',
      customerName: 'Amina Selemani',
      title: 'Kufunga Vyoo Vyote Vya Nyumba Mpya',
      description: 'Mabomba yote yapo, yanatakiwa kuunganishwa na kufungwa vyoo vitatu vya kukaa na beseni 4 za kunawia.',
      professionId: '2', // Plumber
      budgetMin: 80000,
      budgetMax: 150000,
      completionDate: '2026-07-05',
      preferredTime: '09:00 AM',
      location: 'Oysterbay, Dar es Salaam',
      isActive: true,
      photosUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'],
      bids: [
        {
          id: 'BID-10',
          fundiId: 'f1',
          fundiName: 'Juma Shabaan',
          fundiRating: 4.9,
          fundiVerified: true,
          quotationAmount: 120000,
          estimatedDuration: '4 hours',
          warrantyPeriod: '90 Days',
          materialsIncluded: true,
          notes: 'Niko karibu na Oysterbay, ninaweza kuja na materials yote madogo madogo ya kurekebishia.',
          status: 'pending'
        }
      ]
    }
  ]);

  // UI Selection states
  const [selectedFundi, setSelectedFundi] = useState<any>(null); // Fundi object for profile detail modal
  const [selectedFundiDetails, setSelectedFundiDetails] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null); // Portfolio project object for detail modal
  const [reviewFormBooking, setReviewFormBooking] = useState<any>(null); // Booking object to show review form modal

  useEffect(() => {
    if (!selectedFundi) {
      setSelectedFundiDetails(null);
      return;
    }
    const fetchDetails = async () => {
      try {
        const id = selectedFundi.userId || selectedFundi.id;
        const res = await fetch(`/api/fundis/profile/${id}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedFundiDetails(data);
        } else {
          // Fallback if local server or postgres fails
          setSelectedFundiDetails({
            profile: {
              ...selectedFundi,
              bio: selectedFundi.bio || "Mtaalamu mwenye uzoefu wa muda mrefu katika kazi za ujenzi, mabomba na umeme. Nimehudumia zaidi ya wateja 100 kwa ufanisi mkubwa.",
              languages_spoken: ['Swahili', 'English'],
              service_area_type: 'RADIUS',
              service_area_radius: 15.0,
              emergency_service_enabled: selectedFundi.emergencyAvailability || false,
              vacation_mode: false,
              working_hours_start: selectedFundi.workingHoursStart || '08:00',
              working_hours_end: selectedFundi.workingHoursEnd || '17:00',
              lunch_break_start: '12:30',
              lunch_break_end: '13:30',
              identity_verified: selectedFundi.verified || false,
              profession_verified: selectedFundi.verified || false,
              certificate_verified: selectedFundi.verified || false,
              veta_certified: selectedFundi.id === 'f1' || false,
              top_rated: selectedFundi.averageRating >= 4.7 || false,
              background_checked: selectedFundi.verified || false,
              premium_fundi: selectedFundi.subscriptionPlan === 'premium' || false,
            },
            professions: [
              { name_en: selectedFundi.primaryProfession || selectedFundi.profession || 'Electrician', experience_years: selectedFundi.experienceYears || 5, skill_level: 'Expert', starting_price: selectedFundi.price }
            ],
            certificates: [
              { name: 'VETA Electrical Level III Certificate', institution: 'VETA Kipawa', certificate_number: 'VETA-EL-2022', issue_date: '2022-06-15', expiry_date: null, verification_status: 'verified' }
            ],
            education: [
              { institution: 'College of Engineering & Technology (CoET)', course: 'Diploma in Electrical Engineering', level: 'Diploma', start_date: '2019-10-01', end_date: '2022-05-15' }
            ],
            licenses: [
              { license_number: 'EWURA-CLASS-C-2024', authority: 'EWURA', expiry_date: '2029-12-31', status: 'active' }
            ],
            portfolio: portfolios.filter(p => p.fundiId === selectedFundi.id),
            reviews: reviews.filter(r => r.fundiId === selectedFundi.id)
          });
        }
      } catch (err) {
        setSelectedFundiDetails({
          profile: {
            ...selectedFundi,
            bio: selectedFundi.bio || "Mtaalamu mwenye uzoefu wa muda mrefu katika kazi za ujenzi, mabomba na umeme. Nimehudumia zaidi ya wateja 100 kwa ufanisi mkubwa.",
            languages_spoken: ['Swahili', 'English'],
            service_area_type: 'RADIUS',
            service_area_radius: 15.0,
            emergency_service_enabled: selectedFundi.emergencyAvailability || false,
            vacation_mode: false,
            working_hours_start: selectedFundi.workingHoursStart || '08:00',
            working_hours_end: selectedFundi.workingHoursEnd || '17:00',
            lunch_break_start: '12:30',
            lunch_break_end: '13:30',
            identity_verified: selectedFundi.verified || false,
            profession_verified: selectedFundi.verified || false,
            certificate_verified: selectedFundi.verified || false,
            veta_certified: selectedFundi.id === 'f1' || false,
            top_rated: selectedFundi.averageRating >= 4.7 || false,
            background_checked: selectedFundi.verified || false,
            premium_fundi: selectedFundi.subscriptionPlan === 'premium' || false,
          },
          professions: [
            { name_en: selectedFundi.primaryProfession || selectedFundi.profession || 'Electrician', experience_years: selectedFundi.experienceYears || 5, skill_level: 'Expert', starting_price: selectedFundi.price }
          ],
          certificates: [
            { name: 'VETA Electrical Level III Certificate', institution: 'VETA Kipawa', certificate_number: 'VETA-EL-2022', issue_date: '2022-06-15', expiry_date: null, verification_status: 'verified' }
          ],
          education: [
            { institution: 'College of Engineering & Technology (CoET)', course: 'Diploma in Electrical Engineering', level: 'Diploma', start_date: '2019-10-01', end_date: '2022-05-15' }
          ],
          licenses: [
            { license_number: 'EWURA-CLASS-C-2024', authority: 'EWURA', expiry_date: '2029-12-31', status: 'active' }
          ],
          portfolio: portfolios.filter(p => p.fundiId === selectedFundi.id),
          reviews: reviews.filter(r => r.fundiId === selectedFundi.id)
        });
      }
    };
    fetchDetails();
  }, [selectedFundi]);

  // Google Maps simulation states
  const [customerLocation, setCustomerLocation] = useState({ latitude: -6.7823, longitude: 39.2612 }); // Mikocheni
  const [searchRadius, setSearchRadius] = useState<number>(2); // default 2km
  const [filterPrimaryOnly, setFilterPrimaryOnly] = useState<boolean>(false);
  const [filterOtherSkills, setFilterOtherSkills] = useState<boolean>(false);
  const [selectedMapFundi, setSelectedMapFundi] = useState<any>(null); // selected pin popup card
  const [routingPoints, setRoutingPoints] = useState<any[]>([]); // mock coordinates for active route line
  const [isLocating, setIsLocating] = useState(false);

  // Real-time Chat state
  const [chats, setChats] = useState<any[]>([
    {
      id: 'ch_01',
      partnerId: 'f1',
      partnerName: 'Juma Shabaan',
      partnerRole: 'fundi',
      onlineStatus: true,
      lastMessage: 'Kazi ya mabomba imeanza vizuri.',
      lastMessageAt: '2026-06-29T10:05:00Z',
      typing: false,
      messages: [
        { id: 'm1', senderId: 'c_01', text: 'Habari Juma, umefika?', createdAt: '2026-06-29T09:58:00Z', isRead: true },
        { id: 'm2', senderId: 'f1', text: 'Ndio Amina, niko getini tayari.', createdAt: '2026-06-29T10:00:00Z', isRead: true },
        { id: 'm3', senderId: 'f1', text: 'Nimeshaanza kukagua na kurekebisha pampu ya maji.', createdAt: '2026-06-29T10:02:00Z', isRead: true }
      ]
    }
  ]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isTypingSimulated, setIsTypingSimulated] = useState(false);

  // Price Estimator Form state
  const [estimatorForm, setEstimatorForm] = useState({
    category: '2', // plumber
    workType: 'leak', // leak detection
    location: 'Mikocheni',
    propertySize: 'medium',
    urgency: 'normal',
    materialsIncluded: 'no'
  });
  const [pricingEstimate, setPricingEstimate] = useState<any>(null);
  const [showQuoteRequestForm, setShowQuoteRequestForm] = useState(false);
  const [customerTab, setCustomerTab] = useState<'overview' | 'warranties'>('overview');
  const [warranties, setWarranties] = useState<any[]>([
    {
      id: 'WAR-990812',
      bookingId: 'BK-1029',
      warrantyNumber: 'WAR-882718',
      duration: '30 Days',
      startDate: '2026-07-01',
      expiryDate: '2026-07-31',
      qrCodeData: 'https://fundiservice.tz/verify-warranty/WAR-882718',
      customerName: 'Customer Test',
      fundiName: 'Juma Shabaan',
      bookingDescription: 'Kurekebisha AC iliyovuja maji',
      claims: [
        { id: 'CLM-01', description: 'AC inavuja maji tena baada ya siku mbili', status: 'PENDING', createdAt: '2026-07-10' }
      ]
    }
  ]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimBookingId, setClaimBookingId] = useState('');
  const [claimDescription, setClaimDescription] = useState('');

  // Form for Request Quote
  const [quoteForm, setQuoteForm] = useState({
    title: '',
    description: '',
    budget: '',
    completionDate: '',
    preferredTime: '10:00 AM',
    location: '',
    paymentOption: 'online',
    corporateId: '',
    selectMultiple: [] as string[],
    media: [] as File[]
  });

  // Fundi Dashboard tabs
  const [fundiDashboardTab, setFundiDashboardTab] = useState<'profile' | 'bookings' | 'portfolio' | 'quotes' | 'chats'>('profile');

  // Submit states / notifications
  const [notification, setNotification] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(150000); 

  // Slider State for Before & After comparisons
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Floating AI Chatbot
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [botMessages, setBotMessages] = useState([
    { sender: 'bot', text: 'Habari! Mimi ni msaidizi wa AI wa Fundi Service. Unaweza kuniuliza kuhusu mafundi bomba au umeme wa karibu nawe!' }
  ]);
  const [botInput, setBotInput] = useState('');

  // Admin and Super Admin states
  const [adminsList, setAdminsList] = useState([
    { id: 'adm1', name: 'Sofia Ibrahim', email: 'sofia@fundiservice.co.tz', role: 'verification_officer', status: 'active' }
  ]);
  const [disputes, setDisputes] = useState([
    { id: 'D-31', bookingId: 'B-0089', customer: 'Amina Selemani', fundi: 'Juma Shabaan', amount: 25000, status: 'open', reason: 'AC was not fully repaired' }
  ]);
  const [commissionRate, setCommissionRate] = useState(10);
  const [vatRate, setVatRate] = useState(18);
  const [auditLogs, setAuditLogs] = useState([
    { id: 'log-1', action: 'login', ip: '197.250.48.2', browser: 'Chrome', admin: 'Sofia Ibrahim', time: '01:02:15' },
    { id: 'log-2', action: 'verify_fundi_approved', ip: '197.250.48.12', browser: 'Safari', admin: 'Sofia Ibrahim', time: '00:58:32' }
  ]);

  // Become a Fundi Form state
  const [fundiForm, setFundiForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    nationalId: '',
    professions: [] as string[],
    primaryProfession: '',
    profession: 'Plumber',
    skills: '',
    experience: '',
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    ward: 'Mikocheni',
    street: '',
    warranty: '30 Days',
    latitude: '-6.7823',
    longitude: '39.2612',
    nidaFile: '',
    licenseFile: '',
    certFile: '',
    education: '',
    languagesSpoken: '',
    workingRadius: '15',
    emergencyService: false,
    nidaVerified: false,
    nidaVerifiedData: null as any
  });
  const [professionSearchQuery, setProfessionSearchQuery] = useState('');

  // App Releases State
  const [appReleases, setAppReleases] = useState<any[]>([
    { id: 'rel1', version_code: '1.0.0', type: 'apk', download_url: '/app-1.0.0.apk', release_notes: 'Toleo la kwanza la majaribio ya jukwaa.', force_update: false, is_published: true, created_at: '2026-06-28' },
    { id: 'rel2', version_code: '1.0.0', type: 'aab', download_url: '/app-1.0.0.aab', release_notes: 'Android App Bundle toleo la kwanza.', force_update: false, is_published: true, created_at: '2026-06-28' },
    { id: 'rel3', version_code: '1.0.0', type: 'ios', download_url: 'https://apps.apple.com/tz/app/fundiservice', force_update: false, is_published: true, created_at: '2026-06-28' }
  ]);
  const [appForm, setAppForm] = useState({
    versionCode: '',
    type: 'apk',
    downloadUrl: '',
    releaseNotes: '',
    forceUpdate: false
  });
  const [appAnalytics] = useState({
    apk: 142,
    playStore: 453,
    appStore: 210,
    daily: [
      { day: '2026-06-29', apk: 24, play: 80, ios: 35 },
      { day: '2026-06-28', apk: 32, play: 95, ios: 40 },
      { day: '2026-06-27', apk: 45, play: 110, ios: 55 }
    ]
  });

  // Verification document submit states for Fundi dashboard
  const [nidaInput, setNidaInput] = useState('');
  const [selectedNidaFile, setSelectedNidaFile] = useState<string | null>(null);
  const [selectedLicenseFile, setSelectedLicenseFile] = useState<string | null>(null);
  const [selectedCertFile, setSelectedCertFile] = useState<string | null>(null);
  const [webcamSimulated, setWebcamSimulated] = useState(false);

  // Upgraded profile config wizard states
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardStartingPrice, setWizardStartingPrice] = useState(15000);
  const [wizardInspectionFee, setWizardInspectionFee] = useState(5000);
  const [counterFormBidId, setCounterFormBidId] = useState<string | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState('');

  useEffect(() => {
    (window as any).awardVetaBadgeLocal = (fundiId: string) => {
      setFundis(prev => prev.map(f => {
        if (f.id === fundiId) {
          const currentBadges = f.badges || [];
          if (!currentBadges.some((b: any) => b.name === 'VETA Verified')) {
            const vetaBadge = {
              id: 'badge_veta_' + Math.random().toString(36).substr(2, 4),
              name: 'VETA Verified',
              iconName: 'Award',
              color: '#3B82F6',
              category: 'VERIFICATION',
              grantedAt: new Date().toISOString()
            };
            return {
              ...f,
              badges: [...currentBadges, vetaBadge],
              vetaVerified: true,
              verified: true,
              verificationStatus: 'verified'
            };
          }
        }
        return f;
      }));
    };
    return () => {
      delete (window as any).awardVetaBadgeLocal;
    };
  }, []);
  const [counterNotesInput, setCounterNotesInput] = useState('');
  const [wizardBio, setWizardBio] = useState('');
  const [wizardLanguages, setWizardLanguages] = useState<string[]>(['Swahili', 'English']);
  const [wizardRadius, setWizardRadius] = useState(15);
  const [wizardEmergency, setWizardEmergency] = useState(false);
  const [wizardVacation, setWizardVacation] = useState(false);
  const [wizardVacationStart, setWizardVacationStart] = useState('');
  const [wizardVacationEnd, setWizardVacationEnd] = useState('');
  const [wizardWorkingHoursStart, setWizardWorkingHoursStart] = useState('08:00');
  const [wizardWorkingHoursEnd, setWizardWorkingHoursEnd] = useState('17:00');
  const [wizardLunchStart, setWizardLunchStart] = useState('12:30');
  const [wizardLunchEnd, setWizardLunchEnd] = useState('13:30');
  const [wizardWorkingDays, setWizardWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon - Fri
  
  // Registration and email verification states
  const [activeRegisterTab, setActiveRegisterTab] = useState<'customer' | 'company' | 'fundi'>('customer');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCompanyTin, setSignupCompanyTin] = useState('');
  const [signupCompanySector, setSignupCompanySector] = useState('');
  
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sentVerificationCode, setSentVerificationCode] = useState('123456');
  const [pendingUserRegisterPayload, setPendingUserRegisterPayload] = useState<any>(null);
  
  // Login input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Custom Education state
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduCourse, setEduCourse] = useState('');
  const [eduLevel, setEduLevel] = useState('Diploma');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');
  
  // Custom License state
  const [licenseNumberInput, setLicenseNumberInput] = useState('');
  const [licenseAuthority, setLicenseAuthority] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');

  // New Portfolio Item Form states
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    beforeImage: 'https://images.unsplash.com/photo-1542013936693-8848e57423e3?auto=format&fit=crop&q=80&w=600',
    afterImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
    videoUrl: '',
    completionDate: '',
    location: '',
    category: 'Plumber'
  });

  // Fundi Bidding Modal/Form state
  const [activeRequestForBid, setActiveRequestForBid] = useState<any>(null);

  const [customerVersion, setCustomerVersion] = useState<any>({
    version: '1.0.0',
    releaseNotes: 'Toleo la kwanza la majaribio la wateja. Linear maps tracking na malipo vimejumuishwa.',
    fileSizeMb: 24.5,
    androidMinRequirement: 'Android 8.0 (Oreo) or higher',
    downloadUrl: 'http://localhost:5000/download/customer'
  });
  const [fundiVersion, setFundiVersion] = useState<any>({
    version: '1.0.0',
    releaseNotes: 'Toleo la kwanza la majaribio la mafundi. Smart wave dispatch system imewezeshwa.',
    fileSizeMb: 24.5,
    androidMinRequirement: 'Android 8.0 (Oreo) or higher',
    downloadUrl: 'http://localhost:5000/download/fundi'
  });

  useEffect(() => {
    fetch('http://localhost:5500/api/version') // Fallback check or direct local server port
      .then(r => r.json())
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          const cust = res.data.find((d: any) => d.appType === 'customer');
          const fundi = res.data.find((d: any) => d.appType === 'fundi');
          if (cust) {
            setCustomerVersion({
              ...cust,
              downloadUrl: `http://localhost:5000${cust.downloadUrl}`
            });
          }
          if (fundi) {
            setFundiVersion({
              ...fundi,
              downloadUrl: `http://localhost:5000${fundi.downloadUrl}`
            });
          }
        }
      })
      .catch(err => {
        // Fallback locally
        fetch('http://localhost:5000/api/version')
          .then(r => r.json())
          .then(res => {
            if (res.success && Array.isArray(res.data)) {
              const cust = res.data.find((d: any) => d.appType === 'customer');
              const fundi = res.data.find((d: any) => d.appType === 'fundi');
              if (cust) {
                setCustomerVersion({
                  ...cust,
                  downloadUrl: `http://localhost:5000${cust.downloadUrl}`
                });
              }
              if (fundi) {
                setFundiVersion({
                  ...fundi,
                  downloadUrl: `http://localhost:5000${fundi.downloadUrl}`
                });
              }
            }
          })
          .catch(e => console.log('Version fetch fallback error: ', e));
      });
  }, []);
  const [bidForm, setBidForm] = useState({
    amount: '',
    hours: '2 hours',
    warranty: '30 Days',
    materials: false,
    notes: '',
    arrivalTime: '30 mins'
  });

  // Review Submitting Form states
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    beforeImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
    afterImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600',
    videoUrl: '',
    projectCost: '',
    completionDate: ''
  });

  // Distance calculator helper
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  // Simulate routing coordinates when marker clicked
  const simulateRoute = (fundiLat: number, fundiLng: number) => {
    const points = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = customerLocation.latitude + t * (fundiLat - customerLocation.latitude);
      const lng = customerLocation.longitude + t * (fundiLng - customerLocation.longitude);
      // add minor curvature
      const curve = Math.sin(t * Math.PI) * 0.003;
      points.push({ latitude: lat + curve, longitude: lng - curve });
    }
    setRoutingPoints(points);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  // Automatically detect customer location simulated
  const handleDetectLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setCustomerLocation({ latitude: -6.7823, longitude: 39.2612 }); // Mikocheni center
      setIsLocating(false);
      showNotification('Mahali ulipo pametambuliwa kwa usahihi (GPS Coordinates Lock).');
    }, 1200);
  };

  // Calculate pricing estimates dynamically
  const calculateEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const isPlumber = estimatorForm.category === '2';
    const isAC = estimatorForm.category === '3';
    let base = 50000;
    let factor = 1.0;

    if (estimatorForm.workType === 'installation') factor += 0.8;
    if (estimatorForm.workType === 'fault') factor += 0.3;
    if (estimatorForm.propertySize === 'large') factor += 0.5;
    if (estimatorForm.urgency === 'immediate') factor += 0.4;
    if (estimatorForm.materialsIncluded === 'yes') factor += 1.2;

    const price = Math.round(base * factor);
    const minVal = Math.round(price * 0.8);
    const maxVal = Math.round(price * 1.25);
    const labor = Math.round(price * 0.45);
    const materials = estimatorForm.materialsIncluded === 'yes' ? Math.round(price * 0.55) : 0;
    const duration = estimatorForm.workType === 'installation' ? '5-8 masaa' : '2-4 masaa';

    setPricingEstimate({
      min: minVal,
      max: maxVal,
      avg: price,
      laborCost: labor,
      materialCost: materials,
      duration: duration
    });
  };

  // Handle Quote Request Submit
  const handleQuoteRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.title || !quoteForm.description) {
      alert('Tafadhali jaza maelezo na kichwa cha kazi.');
      return;
    }

    const newRequest = {
      id: 'QR-' + Math.floor(100 + Math.random() * 900),
      customerId: currentUser?.id || 'c_01',
      customerName: currentUser?.fullName || 'Amina Selemani',
      title: quoteForm.title,
      description: quoteForm.description,
      professionId: estimatorForm.category,
      budgetMin: Math.round(parseInt(quoteForm.budget || '50000') * 0.8),
      budgetMax: parseInt(quoteForm.budget || '100000'),
      completionDate: quoteForm.completionDate || '2026-07-06',
      preferredTime: quoteForm.preferredTime,
      location: quoteForm.location || 'Mikocheni, Dar es Salaam',
      isActive: true,
      photosUrls: ['https://images.unsplash.com/photo-1542013936693-8848e57423e3?auto=format&fit=crop&q=80&w=600'],
      bids: []
    };

    setQuoteRequests(prev => [newRequest, ...prev]);
    setShowQuoteRequestForm(false);
    showNotification('Maombi ya nukuu ya bei yametumwa kwa mafundi waliochaguliwa!');
    setQuoteForm({ title: '', description: '', budget: '', completionDate: '', preferredTime: '10:00 AM', location: '', paymentOption: 'online', corporateId: '', selectMultiple: [], media: [] });
    setCurrentPath('dashboard');
  };

  // Handle Bid Submit (Fundi)
  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidForm.amount) return;

    const newBid = {
      id: 'BID-' + Math.floor(100 + Math.random() * 900),
      fundiId: currentUser?.id || 'f1',
      fundiName: currentUser?.fullName || 'Juma Shabaan',
      fundiRating: 4.9,
      fundiVerified: true,
      quotationAmount: parseInt(bidForm.amount),
      estimatedDuration: bidForm.hours,
      warrantyPeriod: bidForm.warranty,
      materialsIncluded: bidForm.materials,
      notes: bidForm.notes,
      arrivalTime: bidForm.arrivalTime,
      status: 'pending'
    };

    setQuoteRequests(prev => prev.map(req => {
      if (req.id === activeRequestForBid.id) {
        return {
          ...req,
          bids: [...(req.bids || []), newBid]
        };
      }
      return req;
    }));

    setActiveRequestForBid(null);
    showNotification('Nukuu yako ya bei (Quotation) imewasilishwa kwa mteja!');
    setBidForm({ amount: '', hours: '2 hours', warranty: '30 Days', materials: false, notes: '', arrivalTime: '30 mins' });
  };

  const handleAcceptBid = (reqId: string, bid: any) => {
    const payOnline = window.confirm('Je, ungependa Kulipia Online kupitia Escrow sasa?\n(Chagua OK ili uweke fedha kwenye Escrow Salama, au Cancel kulipia baada ya kazi / Pay After Service)');
    
    let isOnline = false;
    if (payOnline) {
      if (walletBalance < bid.quotationAmount) {
        alert('Salio la Wallet halitoshi! Tafadhali ongeza salio kwanza ili uweke fedha kwenye Escrow.');
        return;
      }
      setWalletBalance(prev => prev - bid.quotationAmount);
      isOnline = true;
    }

    // Initialize booking
    const newBooking = {
      id: 'B-' + Math.floor(1000 + Math.random() * 9000),
      fundi: fundis.find(f => f.id === bid.fundiId) || INITIAL_FUNDIS[0],
      customer: currentUser?.fullName || 'Amina Selemani',
      customerId: currentUser?.id || 'c_01',
      date: new Date().toISOString().split('T')[0],
      time: '12:00 PM',
      address: 'Oysterbay, Dar es Salaam',
      description: 'Accepted Bid Work: ' + quoteRequests.find(q => q.id === reqId)?.description,
      price: bid.quotationAmount,
      status: 'PRICE_CONFIRMED',
      paymentOption: isOnline ? 'online' : 'offline',
      dispute: false
    };

    setBookings(prev => [newBooking, ...prev]);

    // Update quote requests
    setQuoteRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          isActive: false,
          bids: req.bids.map((b: any) => ({
            ...b,
            status: b.id === bid.id ? 'PRICE_CONFIRMED' : 'rejected'
          }))
        };
      }
      return req;
    }));

    showNotification(`Nukuu imekubaliwa! TZS ${bid.quotationAmount.toLocaleString()} imewekwa kwenye Escrow.`);
  };

  // Handle Propose Counter Offer (Customer)
  const handleProposeCounter = (reqId: string, bidId: string) => {
    const counterAmount = parseInt(counterPriceInput);
    if (isNaN(counterAmount) || counterAmount <= 0) {
      alert('Tafadhali ingiza bei sahihi ya kutoa counter offer.');
      return;
    }

    // Update local state
    setQuoteRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          bids: req.bids.map((b: any) => {
            if (b.id === bidId) {
              return {
                ...b,
                quotationAmount: counterAmount,
                notes: `Counter Offer na Mteja: TZS ${counterAmount.toLocaleString()}. Maoni: ${counterNotesInput || 'Hakuna'}`,
                negotiationStatus: 'countered_by_customer'
              };
            }
            return b;
          })
        };
      }
      return req;
    }));

    // Post to active chat
    const targetBid = quoteRequests.find(q => q.id === reqId)?.bids.find((b: any) => b.id === bidId);
    if (targetBid) {
      const fundiId = targetBid.fundiId;
      // Find or create chat
      setChats(prev => {
        const existing = prev.find(c => c.partnerId === fundiId);
        const msgText = `[COUNTER OFFER] Mteja amependekeza bei mbadala ya TZS ${counterAmount.toLocaleString()}. Vidokezo: ${counterNotesInput || 'Hakuna'}`;
        const newMsg = { id: 'm_' + Date.now(), senderId: currentUser?.id || 'c_01', text: msgText, createdAt: new Date().toISOString() };
        if (existing) {
          return prev.map(c => c.partnerId === fundiId ? { ...c, lastMessage: msgText, lastMessageAt: new Date().toISOString(), messages: [...c.messages, newMsg] } : c);
        } else {
          return [...prev, {
            id: 'ch_' + Date.now(),
            partnerId: fundiId,
            partnerName: targetBid.fundiName,
            partnerRole: 'fundi',
            onlineStatus: true,
            lastMessage: msgText,
            lastMessageAt: new Date().toISOString(),
            typing: false,
            messages: [newMsg]
          }];
        }
      });
    }

    setCounterFormBidId(null);
    setCounterPriceInput('');
    setCounterNotesInput('');
    showNotification(`Counter offer ya TZS ${counterAmount.toLocaleString()} imetumwa kwa fundi.`);
  };

  // Handle Reject Bid
  const handleRejectBid = (reqId: string, bidId: string) => {
    setQuoteRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          bids: req.bids.map((b: any) => b.id === bidId ? { ...b, status: 'rejected', negotiationStatus: 'rejected' } : b)
        };
      }
      return req;
    }));
    showNotification('Nukuu ya bei imekataliwa.');
  };

  // Handle document submission for Fundi
  const handleDocsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidaInput) {
      alert('Tafadhali weka namba ya NIDA');
      return;
    }

    setFundis(prev => prev.map(f => {
      if (f.id === currentUser.id) {
        return {
          ...f,
          verificationStatus: 'pending_verification',
          nationalId: nidaInput,
          phoneVerified: true,
          emailVerified: true
        };
      }
      return f;
    }));

    showNotification('Nyaraka zimepakiwa na kutumwa kwa Admin kufanyiwa uhakiki (Pending Verification).');
  };

  // Handle Portfolio Upload
  const handlePortfolioUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioItem.title) return;

    const newItem = {
      id: 'p_' + Date.now(),
      fundiId: currentUser.id,
      title: newPortfolioItem.title,
      description: newPortfolioItem.description,
      beforeImage: newPortfolioItem.beforeImage,
      afterImage: newPortfolioItem.afterImage,
      videoUrl: newPortfolioItem.videoUrl,
      completionDate: newPortfolioItem.completionDate || new Date().toISOString().split('T')[0],
      clientApproved: true,
      serviceCategory: newPortfolioItem.category,
      location: newPortfolioItem.location || 'Dar es Salaam'
    };

    setPortfolios(prev => [newItem, ...prev]);
    showNotification('Kazi mpya imeongezwa kwenye portfolio yako ya kaz!');
    setNewPortfolioItem({ title: '', description: '', beforeImage: 'https://images.unsplash.com/photo-1542013936693-8848e57423e3?auto=format&fit=crop&q=80&w=600', afterImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600', videoUrl: '', completionDate: '', location: '', category: 'Plumber' });
  };

  // Review submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.comment) return;

    const newRev = {
      id: 'r_' + Date.now(),
      bookingId: reviewFormBooking.id,
      customerId: currentUser?.id || 'c_01',
      customerName: currentUser?.fullName || 'Amina Selemani',
      customerPicture: '',
      fundiId: reviewFormBooking.fundi.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      beforePhotosUrls: [reviewForm.beforeImage],
      afterPhotosUrls: [reviewForm.afterImage],
      projectCost: reviewFormBooking.price,
      completionDate: reviewForm.completionDate || new Date().toISOString().split('T')[0],
      isFake: false,
      fakeProbability: 0.00
    };

    setReviews(prev => [newRev, ...prev]);

    // Update booking state
    setBookings(prev => prev.map(b => {
      if (b.id === reviewFormBooking.id) {
        return { ...b, status: 'completed' };
      }
      return b;
    }));

    // Update Fundi profile stats
    setFundis(prev => prev.map(f => {
      if (f.id === reviewFormBooking.fundi.id) {
        const matchingRevs = [newRev, ...reviews].filter(r => r.fundiId === f.id);
        const sum = matchingRevs.reduce((acc, curr) => acc + curr.rating, 0);
        const avg = parseFloat((sum / matchingRevs.length).toFixed(1));
        return {
          ...f,
          rating: avg,
          reviewsCount: matchingRevs.length,
          jobsCompleted: f.jobsCompleted + 1
        };
      }
      return f;
    }));

    setReviewFormBooking(null);
    showNotification('Asante kwa kutoa maoni! Maoni yako ya kweli yamechapishwa.');
  };

  // Unified login handler with auto-role detection & redirection
  const handleUnifiedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = loginEmail.toLowerCase();
    
    if (identifier.includes('super')) {
      setCurrentUser({ id: 'super_adm_1', fullName: 'Sofia Ibrahim (Super)', role: 'super_admin' });
      showNotification('Karibu tena, Super Admin!');
      setCurrentPath('admin-dashboard' as any);
    } else if (identifier.includes('admin') || identifier.includes('officer')) {
      setCurrentUser({ id: 'adm_1', fullName: 'Sofia Ibrahim', role: 'verification_officer' });
      showNotification('Umeingia kwenye Utawala kama Sofia Ibrahim.');
      setCurrentPath('admin-dashboard' as any);
    } else if (identifier.includes('fundi')) {
      setCurrentUser(fundis[0]); // Juma Shabaan
      showNotification('Karibu kwenye ukurasa wako wa Kazi, Fundi Juma!');
      setCurrentPath('dashboard');
    } else if (identifier.includes('company') || identifier.includes('corp')) {
      setCurrentUser({ id: 'corp_mgr_01', fullName: 'Acme Contractors Ltd', role: 'company' });
      showNotification('Karibu kwenye Dashibodi ya Kampuni (Company Dashboard)!');
      setCurrentPath('dashboard');
    } else {
      // Default: Customer role
      setCurrentUser({ id: 'c_01', fullName: 'Amina Selemani', role: 'customer' });
      showNotification('Karibu tena, Amina!');
      setCurrentPath('dashboard');
    }
  };

  // Verify / Badge approvals
  const handleApproveFundi = (fundiId: string) => {
    setFundis(prev => prev.map(f => {
      if (f.id === fundiId) {
        return { 
          ...f, 
          verificationStatus: 'verified', 
          verified: true, 
          verified_badge: true,
          idVerified: true, 
          phoneVerified: true, 
          emailVerified: true, 
          faceVerified: true, 
          certificateVerified: true 
        };
      }
      return f;
    }));
    showNotification('Fundi amethibitishwa na kupewa verified badge!');
  };

  // Registering
  const handleNidaVerify = async () => {
    const cleanNida = fundiForm.nationalId.replace(/-/g, '');
    if (cleanNida.length !== 20 || !/^\d{20}$/.test(cleanNida)) {
      showNotification('Tafadhali weka Namba ya NIDA yenye tarakimu 20 sahihi.');
      return;
    }
    
    showNotification('Inathibitisha kitambulisho cha NIDA...');
    try {
      const response = await fetch('/api/fundis/nida/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nida: cleanNida })
      });
      
      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data.verified) {
          setFundiForm(prev => ({
            ...prev,
            nidaVerified: true,
            nidaVerifiedData: resData.data
          }));
          showNotification('Uhakiki wa NIDA umekamilika kwa mafanikio.');
        } else {
          setFundiForm(prev => ({
            ...prev,
            nidaVerified: true,
            nidaVerifiedData: {
              fullName: fundiForm.fullName || 'Juma Shabaan',
              status: 'PENDING_MANUAL_VERIFICATION'
            }
          }));
          showNotification('Mifumo ya NIDA haikupatikana. Usajili wako utahakikiwa kwa mikono.');
        }
      } else {
        throw new Error('API error');
      }
    } catch (err) {
      setFundiForm(prev => ({
        ...prev,
        nidaVerified: true,
        nidaVerifiedData: {
          fullName: fundiForm.fullName || 'Juma Shabaan',
          status: 'PENDING_MANUAL_VERIFICATION'
        }
      }));
      showNotification('Usajili wa NIDA umechakatwa kama PENDING MANUAL VERIFICATION.');
    }
  };

  const handleCustomerSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      showNotification('Nenosiri halilingani!');
      return;
    }
    const payload = {
      id: 'c_' + Date.now(),
      fullName: signupName,
      email: signupEmail,
      phoneNumber: signupPhone,
      role: 'customer'
    };
    setPendingUserRegisterPayload(payload);
    setShowVerificationModal(true);
    showNotification('Nambari ya uhakiki imetumwa kwenye barua pepe yako (Verification email sent).');
  };

  const handleCompanySignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      showNotification('Nenosiri halilingani!');
      return;
    }
    const payload = {
      id: 'corp_' + Date.now(),
      fullName: signupName,
      email: signupEmail,
      phoneNumber: signupPhone,
      role: 'company',
      tin: signupCompanyTin,
      sector: signupCompanySector
    };
    setPendingUserRegisterPayload(payload);
    setShowVerificationModal(true);
    showNotification('Nambari ya uhakiki imetumwa kwenye barua pepe ya kampuni.');
  };

  const handleRegisterFundiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fundiForm.professions.length === 0) {
      showNotification('Tafadhali chagua angalau taaluma moja.');
      return;
    }
    if (!fundiForm.primaryProfession) {
      showNotification('Tafadhali chagua kazi yako kuu (Main Profession) kuendelea.');
      return;
    }
    const cleanNida = fundiForm.nationalId.replace(/-/g, '');
    if (cleanNida.length !== 20) {
      showNotification('Kitambulisho cha NIDA lazima kiwe na tarakimu 20.');
      return;
    }

    const newFundi = {
      id: 'f_' + Date.now(),
      fullName: fundiForm.fullName,
      profession: fundiForm.primaryProfession,
      primaryProfession: fundiForm.primaryProfession,
      secondaryProfessions: fundiForm.professions.filter(p => p !== fundiForm.primaryProfession),
      professions: fundiForm.professions,
      rating: 0.0,
      reviewsCount: 0,
      jobsCompleted: 0,
      responseTime: 15,
      verified: fundiForm.nidaVerifiedData?.status === 'VERIFIED',
      online: false,
      price: 15000,
      location: `${fundiForm.street}, ${fundiForm.ward}`,
      bio: `Mtaalamu aliyesajiliwa katika ${fundiForm.professions.join(', ')}. Uzoefu: ${fundiForm.experience} ya uzoefu.`,
      skills: fundiForm.skills ? fundiForm.skills.split(',') : [],
      subscription: 'free',
      verificationStatus: fundiForm.nidaVerifiedData?.status === 'VERIFIED' ? 'verified' : 'pending_verification',
      nationalId: fundiForm.nationalId,
      region: fundiForm.region,
      district: fundiForm.district,
      ward: fundiForm.ward,
      street: fundiForm.street,
      latitude: -6.78 + (Math.random() - 0.5) * 0.02,
      longitude: 39.26 + (Math.random() - 0.5) * 0.02,
      serviceWarranty: fundiForm.warranty,
      workingDays: [1, 2, 3, 4, 5],
      workingHoursStart: '08:00',
      workingHoursEnd: '17:00',
      emergencyAvailability: fundiForm.emergencyService,
      onSiteService: true,
      remoteService: false,
      phoneVerified: true,
      emailVerified: false,
      faceVerified: false,
      certificateVerified: false,
      idVerified: fundiForm.nidaVerified,
      education: fundiForm.education,
      languagesSpoken: fundiForm.languagesSpoken,
      workingRadius: fundiForm.workingRadius,
      role: 'fundi'
    };

    setPendingUserRegisterPayload(newFundi);
    setShowVerificationModal(true);
    showNotification('Nambari ya uhakiki imetumwa kwenye barua pepe ya Fundi.');
  };

  const handleVerifyConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === sentVerificationCode) {
      if (pendingUserRegisterPayload) {
        const activeUser = { ...pendingUserRegisterPayload, emailVerified: true };
        if (activeUser.role === 'fundi') {
          setFundis(prev => [...prev, activeUser]);
        }
        setCurrentUser(activeUser);
        setCurrentPath('dashboard');
        showNotification('Akaunti yako imethibitishwa na kuamilishwa kikamilifu!');
      }
      setShowVerificationModal(false);
      setVerificationCode('');
    } else {
      showNotification('Nambari ya uhakiki si sahihi. Jaribu tena au omba kutumiwa upya (Resend).');
    }
  };

  // Simulate Sending Chat Message
  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeChatId) return;

    const activeSession = chats.find(c => c.id === activeChatId);
    if (!activeSession) return;

    const newMsg = {
      id: 'msg_' + Date.now(),
      senderId: currentUser?.id || 'c_01',
      text: chatInput,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          lastMessage: chatInput,
          lastMessageAt: new Date().toISOString(),
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    setChatInput('');

    // Simulate automatic fundi/partner response after 1.5 seconds
    setIsTypingSimulated(true);
    setTimeout(() => {
      setIsTypingSimulated(false);
      const replyMsg = {
        id: 'msg_' + (Date.now() + 1),
        senderId: activeSession.partnerId,
        text: 'Sawa, nimepokea ujumbe wako. Nami nafuatilia kazi hiyo hapa.',
        createdAt: new Date().toISOString(),
        isRead: true
      };
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            lastMessage: replyMsg.text,
            lastMessageAt: new Date().toISOString(),
            messages: [...c.messages, replyMsg]
          };
        }
        return c;
      }));
    }, 1500);
  };

  const handleStartChatWithFundi = (fundi: any) => {
    // Check if session exists
    let session = chats.find(c => c.partnerId === fundi.id);
    if (!session) {
      const newSession = {
        id: 'ch_' + Date.now(),
        partnerId: fundi.id,
        partnerName: fundi.fullName,
        partnerRole: 'fundi',
        onlineStatus: fundi.online,
        lastMessage: 'Halo!',
        lastMessageAt: new Date().toISOString(),
        typing: false,
        messages: []
      };
      setChats(prev => [newSession, ...prev]);
      session = newSession;
    }
    setActiveChatId(session.id);
    setCurrentPath('dashboard');
    if (currentUser?.role === 'fundi') {
      setFundiDashboardTab('chats');
    }
  };

  // Bot response simulator
  const handleBotChat = () => {
    if (!botInput.trim()) return;
    const userMsg = botInput.trim().toLowerCase();
    const newBotMsgs = [...botMessages, { sender: 'user', text: botInput }];
    setBotMessages(newBotMsgs);
    setBotInput('');

    setTimeout(() => {
      let reply = 'Samahani, sijaelewa kabisa. Unaweza kusema "mabomba", "umeme" au "kukadiria bei".';
      if (userMsg.includes('plumber') || userMsg.includes('bomba')) {
        reply = 'Fundi Juma Shabaan ndiye mtaalamu wa Plumber aliyepo karibu nawe Mikocheni (1.2 km). Ana average ya nyota 4.9.';
      } else if (userMsg.includes('umeme') || userMsg.includes('electrician')) {
        reply = 'Fundi Baraka Joseph ni mtaalamu wa umeme aliyepo Sinza (2.4 km). Amekamilisha kazi 54 zenye kiwango bora.';
      } else if (userMsg.includes('bei') || userMsg.includes('estimate')) {
        reply = 'Unaweza kufungua ukurasa wa "Huduma Zetu" na kutumia Kikadiria Bei chetu cha kisasa cha AI (Smart Price Estimator).';
      }
      setBotMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 800);
  };

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if ((adminEmail === 'admin@fundi.co.tz' && adminPassword === 'AdminSecure2026') || (adminEmail === 'super@fundi.co.tz' && adminPassword === 'SuperSecure2026')) {
      const isSuper = adminEmail.startsWith('super');
      setCurrentUser({
        id: isSuper ? 'super_adm_1' : 'adm_1',
        fullName: isSuper ? 'Sofia Ibrahim (Super)' : 'Sofia Ibrahim',
        role: isSuper ? 'super_admin' : 'verification_officer',
      });
      showNotification('Umeingia kwenye Utawala kwa mafanikio!');
      setCurrentPath('admin-dashboard' as any);
    } else {
      setAdminError('Barua pepe au Nenosiri si sahihi.');
    }
  };

  if (currentPath === 'ops-center') {
    return <OpsCenter onBackToAdmin={() => setCurrentPath('admin-dashboard' as any)} />;
  }

  if (currentPath === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-brand-500 selection:text-white">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl relative animate-fadeIn">
          <button 
            onClick={() => setCurrentPath('home')} 
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
          >
            &times;
          </button>
          
          <div className="bg-slate-950/60 text-[10px] font-mono text-slate-400 p-2 rounded-xl text-center border border-slate-750">
            Njia / Route: <span className="text-brand-400 font-bold">/login</span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Ingia Kwenye Mfumo (Login)</h2>
            <p className="text-xs text-slate-400 font-medium">Weka barua pepe na nenosiri lako ili kuendelea.</p>
          </div>

          <form onSubmit={handleUnifiedLogin} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-slate-455 text-slate-400">Barua Pepe (Email Address)</label>
              <input 
                type="email" 
                required 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="customer@fundi.co.tz" 
                className="w-full bg-slate-900 border border-slate-700 outline-none px-4 py-3 rounded-xl text-white font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-455 text-slate-400">Nenosiri (Password)</label>
              <input 
                type="password" 
                required 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 outline-none px-4 py-3 rounded-xl text-white font-semibold"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold">
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-350 select-none">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-brand-500 border-slate-700 focus:ring-brand-500 accent-brand-500 bg-slate-900" 
                />
                <span>Nikumbuke (Remember Me)</span>
              </label>
              <button 
                type="button" 
                onClick={() => {
                  const val = prompt('Weka Barua Pepe yako ili kutumiwa kiungo cha kuseti upya nenosiri (Reset Link):');
                  if (val) showNotification('Kiungo cha kuseti upya nenosiri kimetumwa kwenye barua pepe yako!');
                }}
                className="text-brand-400 hover:underline"
              >
                Umesahau Nenosiri?
              </button>
            </div>

            <button 
              type="submit" 
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all text-xs uppercase"
            >
              Ingia
            </button>
          </form>

          {/* Social Logins Placeholder */}
          <div className="space-y-3 pt-3 border-t border-slate-700/60">
            <p className="text-[10px] uppercase font-black text-slate-400 text-center tracking-wider">Au Ingia Kutumia</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => showNotification('Google login coming soon')} className="bg-slate-900 border border-slate-750 hover:bg-slate-750 p-2.5 rounded-xl font-bold text-[10px] text-slate-300">Google</button>
              <button onClick={() => showNotification('Apple login coming soon')} className="bg-slate-900 border border-slate-750 hover:bg-slate-750 p-2.5 rounded-xl font-bold text-[10px] text-slate-300">Apple</button>
              <button onClick={() => showNotification('Microsoft login coming soon')} className="bg-slate-900 border border-slate-750 hover:bg-slate-750 p-2.5 rounded-xl font-bold text-[10px] text-slate-300">Microsoft</button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-455">
              Huna Akaunti?{' '}
              <button 
                onClick={() => {
                  setActiveRegisterTab('customer');
                  setCurrentPath('register' as any);
                }} 
                className="text-brand-400 font-bold hover:underline"
              >
                Jisajili Sasa (Sign Up)
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentPath === ('admin-login' as any)) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-brand-500 selection:text-white">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl relative animate-fadeIn">
          <button 
            onClick={() => setCurrentPath('home')} 
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
          >
            &times;
          </button>
          
          <div className="bg-slate-950/60 text-[10px] font-mono text-slate-400 p-2 rounded-xl text-center border border-slate-750">
            Njia / Route: <span className="text-brand-400 font-bold">/admin/login</span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Utawala (Admin Portal)</h2>
            <p className="text-xs text-slate-405 text-slate-400">Ingia kwa usalama kutumia barua pepe ya kampuni.</p>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs font-semibold">
            {adminError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl font-bold">
                {adminError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-slate-400">Barua Pepe (Company Email)</label>
              <input 
                type="email" 
                required 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@fundi.co.tz"
                className="w-full bg-slate-900 border border-slate-700 outline-none px-4 py-3 rounded-xl text-white font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Nenosiri (Password)</label>
              <input 
                type="password" 
                required 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 outline-none px-4 py-3 rounded-xl text-white font-semibold"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all text-xs uppercase"
            >
              Thibitisha na Ingia
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentPath === 'dashboard' && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 font-sans space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold text-center">
          Tafadhali ingia kwanza ili uweze kuona Dashboard yako. (Authentication Required)
        </div>
        <button 
          onClick={() => setCurrentPath('login')}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl"
        >
          Nenda Kwenye Ukurasa wa Kuingia (Login)
        </button>
      </div>
    );
  }

  if (currentPath === ('admin-dashboard' as any)) {
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'verification_officer' && currentUser.role !== 'admin')) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 font-sans space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold text-center">
            403 Forbidden: Huna ruhusa ya kufikia ukurasa huu.
          </div>
          <button 
            onClick={() => setCurrentPath('admin-login' as any)}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl"
          >
            Nenda Kwenye Login ya Admin
          </button>
        </div>
      );
    }
    return <AdminDashboard 
      onBackToCustomer={() => {
        setCurrentUser(null);
        setCurrentPath('home');
      }} 
      onOpenOpsCenter={() => setCurrentPath('ops-center')}
    />;
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans`}>
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer animate-fadeIn" onClick={() => setCurrentPath('home')}>
            <div className="bg-brand-500 text-white p-2.5 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-tanzanite-500 dark:from-brand-500 dark:to-cyan-400 bg-clip-text text-transparent">
                Fundi Service
              </span>
              <span className="text-[10px] block text-slate-400 font-medium">Tanzania Pro Workspace</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6">
            <button onClick={() => setCurrentPath('home')} className={`text-sm font-semibold hover:text-brand-500 transition-colors ${currentPath === 'home' ? 'text-brand-500' : 'text-slate-500 dark:text-slate-350'}`}>{t('home')}</button>
            <button onClick={() => setCurrentPath('services')} className={`text-sm font-semibold hover:text-brand-500 transition-colors ${currentPath === 'services' ? 'text-brand-500' : 'text-slate-500 dark:text-slate-350'}`}>{t('estimator')}</button>
            <button onClick={() => setCurrentPath('find-fundi')} className={`text-sm font-semibold hover:text-brand-500 transition-colors ${currentPath === 'find-fundi' ? 'text-brand-500' : 'text-slate-500 dark:text-slate-350'}`}>{t('interactiveMap')}</button>
            <button onClick={() => setCurrentPath('download')} className={`text-sm font-semibold hover:text-brand-500 transition-colors ${currentPath === 'download' ? 'text-brand-500' : 'text-slate-500 dark:text-slate-350'}`}>{t('downloadApp')}</button>
            <button onClick={() => setCurrentPath('about')} className={`text-sm font-semibold hover:text-brand-500 transition-colors ${currentPath === 'about' ? 'text-brand-500' : 'text-slate-500 dark:text-slate-350'}`}>{t('aboutUs')}</button>
            <button onClick={() => setCurrentPath('contact' as any)} className={`text-sm font-semibold hover:text-brand-500 transition-colors ${currentPath === 'contact' ? 'text-brand-500' : 'text-slate-500 dark:text-slate-350'}`}>{t('contactUs')}</button>
          </nav>

          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleLanguage}
              className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-650 hover:bg-slate-205 transition-all"
            >
              {language === 'sw' ? 'English (EN)' : 'Kiswahili (SW)'}
            </button>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-all"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-2">
                <PrimaryButton 
                  onClick={() => setCurrentPath('dashboard')}
                >
                  Dashboard
                </PrimaryButton>
                <button 
                  onClick={() => {
                    setCurrentUser(null);
                    setCurrentPath('home');
                    showNotification('Umetoka kwenye mfumo.');
                  }}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentPath('login')}
                  className="text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-205 dark:hover:bg-slate-750 rounded-xl transition-all"
                >
                  Ingia (Login)
                </button>
                <PrimaryButton 
                  onClick={() => setCurrentPath('become-fundi')}
                >
                  Kuwa Fundi Wetu
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900/95 dark:bg-slate-900 border border-slate-700 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-slideIn">
          <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-500">
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* MAIN VIEW */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:py-8">
        
        {/* 1. PUBLIC HOME PAGE */}
        {currentPath === 'home' && (
          <div className="space-y-16 animate-fadeIn">
            {/* Hero section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-brand-600 via-brand-500 to-tanzanite-600 text-white p-8 md:p-16 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60"></div>
              <div className="max-w-2xl space-y-6 relative z-10">
                <div className="inline-flex items-center space-x-2 bg-white/25 px-4 py-1.5 rounded-full text-xs font-extrabold backdrop-blur-sm border border-white/20">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Uhakiki Thabiti wa NIDA na Vyeti vya Taaluma</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  Tafuta Fundi Aliyethibitishwa na VETA
                </h1>
                <p className="text-white/90 text-sm md:text-base leading-relaxed">
                  Mfumo pekee unaounganisha wateja na mafundi salama na waaminifu kupitia **Escrow Wallet system**. Malipo yako yanalindwa na yanapelekwa kwa fundi baada ya kazi kukamilika na kuridhisha.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={() => setCurrentPath('find-fundi')}
                    className="bg-gradient-to-r from-brand-500 via-brand-550 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 duration-300 flex items-center space-x-2 border-0"
                  >
                    <MapPin className="w-4 h-4 animate-bounce" />
                    <span>{language === 'sw' ? 'Angalia Fundi wa Karibu' : 'Interactive GPS Map'}</span>
                  </button>
                  <button 
                    onClick={() => setCurrentPath('services')}
                    className="bg-tanzanite-600 hover:bg-tanzanite-700 text-white font-extrabold text-sm px-7 py-3.5 rounded-xl border border-white/20 shadow-lg transition-all"
                  >
                    AI Price Estimator
                  </button>
                </div>
              </div>
            </div>
            {/* EXPLORE OUR SERVICES SECTION */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Gundua Huduma Zetu (Explore Our Services)</h2>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Browse our premium marketplace services & connect with vetted experts</p>
                </div>
                <button 
                  onClick={() => {
                    setCurrentPath('services');
                    setMQuery('');
                  }}
                  className="text-xs font-black text-brand-500 hover:text-brand-650 flex items-center space-x-1"
                >
                  <span>Angalia Huduma Zote (View All Services) &rarr;</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_PROFESSIONS.slice(0, 8).map(prof => {
                  const sDetails = getProfessionDetails(prof.id, prof.nameEn, prof.nameSw);
                  const matchingFundis = fundis.filter(f => f.profession === prof.nameEn);
                  const avgRating = matchingFundis.length > 0
                    ? (matchingFundis.reduce((acc, curr) => acc + curr.rating, 0) / matchingFundis.length).toFixed(1)
                    : '4.8';
                  const startingPrice = sDetails.priceRange.split(' - ')[0];

                  return (
                    <div key={prof.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
                      <div className="h-40 overflow-hidden relative">
                        <img 
                          src={sDetails.image} 
                          alt={language === 'sw' ? prof.nameSw : prof.nameEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded-xl text-slate-700 dark:text-slate-200 shadow-sm">
                          <prof.icon className="w-4 h-4 text-brand-500" />
                        </div>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-brand-500 transition-colors">
                            {language === 'sw' ? prof.nameSw : prof.nameEn}
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                            {language === 'sw' ? sDetails.descriptionSw : sDetails.description}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-semibold">Fundis Waliopo</span>
                            <span className="font-black text-slate-700 dark:text-slate-350">{matchingFundis.length + 3} Available</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-semibold">Wastani wa Rating</span>
                            <span className="flex items-center space-x-1 font-black text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{avgRating}</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-semibold">Kuanzia (Starting)</span>
                            <span className="font-extrabold text-brand-500">{startingPrice}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button 
                            onClick={() => {
                              setSelectedService(sDetails);
                            }}
                            className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-[10px] py-2 rounded-xl transition-colors"
                          >
                            View Fundis
                          </button>
                          <button 
                            onClick={() => {
                              // Open quick quote or direct quote modal for this service
                              setActiveRequestForBid({
                                id: 'req-' + Math.floor(1000 + Math.random() * 9000),
                                title: language === 'sw' ? prof.nameSw : prof.nameEn,
                                description: 'Quick Booking from Homepage',
                                professionId: prof.id
                              });
                            }}
                            className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-[10px] py-2 rounded-xl shadow-sm transition-colors"
                          >
                            Book Service
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>



            {/* Smart recommendations gallery */}
            <div className="space-y-6 pt-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Mafundi Waliopendekezwa (Recommended For You)</h2>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">AI Recommendation based on score, ratings & verified status</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fundis.slice(0, 2).map(f => (
                  <div key={f.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-brand-500/10 text-brand-500 text-[10px] font-extrabold px-3.5 py-1.5 rounded-bl-2xl uppercase tracking-wider flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>Best Match (Score 98%)</span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-brand-100 dark:bg-brand-950/40 rounded-full flex items-center justify-center font-black text-brand-650 dark:text-brand-400 text-lg border border-brand-200/50 dark:border-brand-900/50">
                          {f.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <h3 className="font-extrabold text-sm">{f.fullName}</h3>
                            {f.verified && (
                              <span className="bg-brand-500 text-white p-0.5 rounded-full" title="Government ID, Face & VETA verified">
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-medium">{f.profession} | Uzoefu: {f.experience_years || 8} miaka</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{f.bio}</p>

                      <div className="flex flex-wrap gap-2.5">
                        {f.skills.slice(0, 3).map((s: string, i: number) => (
                          <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-350 px-2.5 py-1 rounded-lg font-semibold">{s}</span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[11px] border-t border-slate-100 dark:border-slate-800 pt-4">
                        <div>
                          <span className="text-slate-400 block">Kiwango cha Bei</span>
                          <span className="font-extrabold text-brand-500">TZS {f.price.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Udhamini (Warranty)</span>
                          <span className="font-extrabold text-slate-700 dark:text-slate-200">{f.serviceWarranty || '30 Days'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedFundi(f);
                        }}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-all"
                      >
                        Angalia Profile & Kazi
                      </button>
                      <button 
                        onClick={() => handleStartChatWithFundi(f)}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professions list section */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Kategoria ya Huduma zetu</h2>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">VETA certified and verified fundis online</p>
                </div>
                <button 
                  onClick={() => setCurrentPath('find-fundi')}
                  className="text-xs font-bold text-brand-500 hover:underline flex items-center space-x-1"
                >
                  <span>Angalia wote</span>
                  <span>&rarr;</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {MOCK_PROFESSIONS.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => {
                      setSearchProfession(p.id);
                      setCurrentPath('find-fundi');
                    }}
                    className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-6 rounded-2xl flex items-center space-x-5 shadow-sm hover:shadow-xl hover:border-brand-500/50 dark:hover:border-brand-500/55 transition-all cursor-pointer group"
                  >
                    <div className="bg-brand-50 dark:bg-brand-950/40 p-4 rounded-2xl text-brand-500 group-hover:scale-110 transition-transform w-14 h-14 flex items-center justify-center overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.nameEn} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <p.icon className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors">{language === 'sw' ? p.nameSw : p.nameEn}</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Mafundi {fundis.filter(f => (f.professions ? f.professions.includes(p.nameEn) : f.profession === p.nameEn) && f.verificationStatus === 'verified').length} wapo hewani</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-slate-800 shadow-2xl">
              <div className="space-y-3 mb-6 md:mb-0 max-w-xl">
                <div className="bg-brand-500/10 text-brand-400 border border-brand-500/30 w-fit text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Interactive Features Loaded</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black">
                  Toleo Jipya la Simu (Mobile App release)
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Toleo la v1.0.0 sasa limezinduliwa rasmi! Pakua faili la APK moja kwa moja ili uweze kufuatilia eneo la fundi kwa GPS na kuwasiliana naye kupitia direct chat.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="http://localhost:5000/api/app/download/apk"
                  className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2"
                >
                  <FileDown className="w-4 h-4 text-brand-500" />
                  <span>Download APK (24MB)</span>
                </a>
                <button 
                  onClick={() => setCurrentPath('find-fundi')}
                  className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Tafuta Mafundi wa Karibu</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. PUBLIC SMART PRICE ESTIMATOR & HUDUMA ZETU */}
        {currentPath === 'services' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Title / Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-brand-900 text-white p-8 md:p-12 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent opacity-60"></div>
              <div className="max-w-2xl space-y-4 relative z-10">
                <span className="inline-flex items-center space-x-1.5 bg-brand-500/25 border border-brand-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>Soko la Mafundi (Premium Services Marketplace)</span>
                </span>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
                  Soko la Huduma na Makadirio ya Bei
                </h1>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  Tafuta huduma yoyote inayohitajika, kagua makadirio ya soko, na ulinganishe mafundi waliothibitishwa wa karibu yako. Unaweza pia kutumia AI kukadiria bei ya mradi wako.
                </p>
              </div>
            </div>

            {/* Marketplace Main Container */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left Side: Advanced Search & Filters Panel */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-brand-500" />
                    <span>Tafuta & Chuja (Filters)</span>
                  </h3>
                  
                  {/* Search Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Tafuta kwa Neno Muhimu</label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="e.g. Bomba, AC, Wiring..."
                        value={mQuery}
                        onChange={(e) => setMQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs pl-10 pr-4 py-2.5 rounded-xl font-semibold"
                      />
                    </div>
                  </div>

                  {/* Location Filters */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Mkoa (Region)</label>
                      <select 
                        value={mRegion} 
                        onChange={(e) => setMRegion(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs px-3.5 py-2.5 rounded-xl font-semibold"
                      >
                        <option value="">Mikoa Yote</option>
                        <option value="Dar es Salaam">Dar es Salaam</option>
                        <option value="Arusha">Arusha</option>
                        <option value="Mwanza">Mwanza</option>
                        <option value="Dodoma">Dodoma</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Wilaya (District)</label>
                      <input 
                        type="text"
                        placeholder="e.g. Kinondoni, Ilala..."
                        value={mDistrict}
                        onChange={(e) => setMDistrict(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs px-3.5 py-2.5 rounded-xl font-semibold"
                      />
                    </div>
                  </div>

                  {/* Ratings / Badges */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Rating Kuanzia</span>
                      <span className="text-xs font-extrabold text-amber-500 flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{mRating > 0 ? `${mRating}+ Star` : 'Zote'}</span>
                      </span>
                    </div>
                    <div className="flex gap-1.5 justify-between">
                      {[3, 4, 4.5].map((star) => (
                        <button 
                          key={star}
                          onClick={() => setMRating(mRating === star ? 0 : star)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-colors ${mRating === star ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                        >
                          {star}★+
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={mVerifiedOnly} 
                          onChange={(e) => setMVerifiedOnly(e.target.checked)}
                          className="rounded text-brand-500 accent-brand-500" 
                        />
                        <span>Mafundi Waliothibitishwa Tu</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={mEmergencyOnly} 
                          onChange={(e) => setMEmergencyOnly(e.target.checked)}
                          className="rounded text-brand-500 accent-brand-500" 
                        />
                        <span>Emergency (Masaa 24) Tu</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={mWarrantyOnly} 
                          onChange={(e) => setMWarrantyOnly(e.target.checked)}
                          className="rounded text-brand-500 accent-brand-500" 
                        />
                        <span>Inajumuisha Warranty Tu</span>
                      </label>
                    </div>
                  </div>

                  {/* Price & Experience */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Radius ya Umbali (km)</span>
                        <span className="text-brand-500 font-extrabold">{mDistance} km</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="100" 
                        value={mDistance} 
                        onChange={(e) => setMDistance(parseInt(e.target.value))}
                        className="w-full accent-brand-500" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Uzoefu (Experience Years)</label>
                      <select 
                        value={mExperience}
                        onChange={(e) => setMExperience(parseInt(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs px-3.5 py-2.5 rounded-xl font-semibold"
                      >
                        <option value="0">Uzoefu Wowote</option>
                        <option value="2">Miaka 2+</option>
                        <option value="5">Miaka 5+</option>
                        <option value="8">Miaka 8+</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setMQuery('');
                      setMRegion('');
                      setMDistrict('');
                      setMRating(0);
                      setMVerifiedOnly(false);
                      setMEmergencyOnly(false);
                      setMDistance(50);
                      setMExperience(0);
                      setMLanguage('');
                      setMWarrantyOnly(false);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>

                {/* AI Price Estimator Quick Launcher */}
                <div className="bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900 p-6 rounded-3xl text-center space-y-4">
                  <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center mx-auto shadow-md">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">AI Price Estimator</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Je, ungependa kupata makadirio ya bei ya mradi wako haraka kwa kutumia AI?</p>
                  </div>
                  <button 
                    onClick={() => {
                      // Navigate or launch direct AI calculator panel
                      alert('Unaweza kutumia fomu ya AI Price Estimator kuanzia ukurasa wa nyumbani, au kuchagua huduma hapa chini kujua bei ya wastani ya soko.');
                    }}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-colors"
                  >
                    Launch Calculator
                  </button>
                </div>
              </div>

              {/* Right Side: Services Listings / Map switch */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* View Toggler & Stats */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Tulipata Kategoria {MOCK_PROFESSIONS.length} za Huduma
                  </span>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setMarketplaceViewMode('list')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${marketplaceViewMode === 'list' ? 'bg-brand-500 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Orodha (List View)</span>
                    </button>
                    <button 
                      onClick={() => setMarketplaceViewMode('map')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${marketplaceViewMode === 'map' ? 'bg-brand-500 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>Ramani (Map View)</span>
                    </button>
                  </div>
                </div>

                {/* Conditional View Rendering */}
                {marketplaceViewMode === 'list' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_PROFESSIONS
                      .filter(prof => {
                        const sDetails = getProfessionDetails(prof.id, prof.nameEn, prof.nameSw);
                        const matchQuery = !mQuery || 
                          prof.nameEn.toLowerCase().includes(mQuery.toLowerCase()) ||
                          prof.nameSw.toLowerCase().includes(mQuery.toLowerCase()) ||
                          sDetails.description.toLowerCase().includes(mQuery.toLowerCase());
                        
                        return matchQuery;
                      })
                      .map(prof => {
                        const sDetails = getProfessionDetails(prof.id, prof.nameEn, prof.nameSw);
                        const matchingFundis = fundis.filter(f => {
                          const nameMatches = f.profession === prof.nameEn;
                          if (!nameMatches) return false;
                          
                          // Filters
                          if (mRegion && f.region !== mRegion) return false;
                          if (mDistrict && !f.district.toLowerCase().includes(mDistrict.toLowerCase())) return false;
                          if (mRating > 0 && f.rating < mRating) return false;
                          if (mVerifiedOnly && !f.verified) return false;
                          if (mEmergencyOnly && !f.emergencyAvailability) return false;
                          if (mExperience > 0 && (f.experienceYears || 5) < mExperience) return false;
                          if (mWarrantyOnly && (!f.serviceWarranty || f.serviceWarranty === 'No Warranty')) return false;
                          
                          return true;
                        });

                        const avgRating = matchingFundis.length > 0
                          ? (matchingFundis.reduce((acc, curr) => acc + curr.rating, 0) / matchingFundis.length).toFixed(1)
                          : '4.8';
                        const startingPrice = sDetails.priceRange.split(' - ')[0];

                        return (
                          <div key={prof.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
                            <div className="h-44 overflow-hidden relative">
                              <img 
                                src={sDetails.image} 
                                alt={language === 'sw' ? prof.nameSw : prof.nameEn}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded-xl text-slate-700 dark:text-slate-200 shadow-md">
                                <prof.icon className="w-4 h-4 text-brand-500" />
                              </div>
                              <div className="absolute bottom-4 right-4 bg-brand-500 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-full shadow">
                                {startingPrice}
                              </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-brand-500 transition-colors text-base">
                                  {language === 'sw' ? prof.nameSw : prof.nameEn}
                                </h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                                  {language === 'sw' ? sDetails.descriptionSw : sDetails.description}
                                </p>
                              </div>

                              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-400 font-semibold">Mafundi Waliopo (Matching)</span>
                                  <span className="font-black text-slate-700 dark:text-slate-350">{matchingFundis.length} Active Fundis</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-400 font-semibold">Average Rating</span>
                                  <span className="flex items-center space-x-1 font-black text-amber-500">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span>{avgRating}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 pt-3">
                                <button 
                                  onClick={() => setSelectedService(sDetails)}
                                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 rounded-xl transition-colors"
                                >
                                  View Details & Fundis
                                </button>
                                <button 
                                  onClick={() => {
                                    setActiveRequestForBid({
                                      id: 'req-' + Math.floor(1000 + Math.random() * 9000),
                                      title: language === 'sw' ? prof.nameSw : prof.nameEn,
                                      description: 'Marketplace Quick Booking',
                                      professionId: prof.id
                                    });
                                  }}
                                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-colors"
                                >
                                  Book Service
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  // Map View
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Interactive Marketplace Map</h3>
                        <p className="text-[10px] text-slate-400">Showing available Fundis in Kinondoni, Dar es Salaam (Mikocheni area)</p>
                      </div>
                      <span className="px-2.5 py-1 bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 rounded-full text-[10px] font-black">GPS Enabled</span>
                    </div>

                    {/* Simulation Map Canvas */}
                    <div className="h-[450px] bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center text-center">
                      {/* Grid representation */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#3b82f6_1.5px,_transparent_1.5px)] [background-size:24px_24px] opacity-15"></div>
                      
                      {/* Micro coordinates layout */}
                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 space-y-0.5 font-bold">
                        <div>Dar es Salaam Center</div>
                        <div>Coords: -6.7794° S, 39.2605° E</div>
                      </div>

                      {/* Map Pins */}
                      {fundis.slice(0, 5).map((f, i) => {
                        const lefts = ['35%', '55%', '65%', '45%', '25%'];
                        const tops = ['40%', '35%', '50%', '60%', '55%'];
                        
                        return (
                          <button 
                            key={f.id}
                            onClick={() => {
                              setSelectedFundi(f);
                            }}
                            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group animate-bounce"
                            style={{ left: lefts[i], top: tops[i], animationDelay: `${i * 0.15}s` }}
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full border-2 border-brand-500 bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <span className="text-[10px] font-black text-brand-500">{f.fullName.split(' ')[0]}</span>
                              </div>
                              <MapPin className="w-5 h-5 text-brand-500 fill-white dark:fill-slate-900 mx-auto -mt-1 shadow" />
                              
                              {/* Quick popup on hover */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 text-white text-[9px] font-black rounded-lg px-2 py-1 whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                {f.fullName} ({f.profession})
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold max-w-sm pointer-events-none relative z-10">
                        Click on the interactive map pins to view available Fundi profiles, start chats, or request instant quotations.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {currentPath === 'find-fundi' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Control panel and filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black flex items-center space-x-2">
                    <Compass className="w-5 h-5 text-brand-500 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Tafuta Mafundi Walio Karibu</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Interactive Live-GPS Map Dashboard</p>
                </div>

                <button 
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-205 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 transition-all"
                >
                  <MapPin className="w-4 h-4 text-brand-500" />
                  <span>{isLocating ? 'Inatafuta GPS...' : 'Tambua Eneo Langu (GPS)'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400 block">Kategoria ya Fundi</label>
                  <select 
                    value={searchProfession} 
                    onChange={(e) => setSearchProfession(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <option value="all">{language === 'sw' ? 'Kategoria Zote (All)' : 'All Categories'}</option>
                    {MOCK_PROFESSIONS.map(p => (
                      <option key={p.id} value={p.id}>
                        {language === 'sw' ? p.nameSw : p.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <label>Umbali wa Juu (Search Radius)</label>
                    <span className="text-brand-500 font-bold">{searchRadius} km</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={searchRadius}
                    onChange={(e) => {
                      setSearchRadius(parseInt(e.target.value));
                      setSelectedMapFundi(null);
                      setRoutingPoints([]);
                    }}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2 pb-1 text-[11px] font-bold">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={filterPrimaryOnly}
                      onChange={(e) => {
                        setFilterPrimaryOnly(e.target.checked);
                        if (e.target.checked) setFilterOtherSkills(false);
                      }}
                      className="w-4 h-4 rounded text-brand-500 border-slate-350 focus:ring-brand-400 accent-brand-500"
                    />
                    <span className="text-slate-700 dark:text-slate-350">
                      🎯 {language === 'sw' ? 'Kazi Kuu Tu (Primary Only)' : 'Primary Specialty Only'}
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={filterOtherSkills}
                      onChange={(e) => {
                        setFilterOtherSkills(e.target.checked);
                        if (e.target.checked) setFilterPrimaryOnly(false);
                      }}
                      className="w-4 h-4 rounded text-brand-500 border-slate-350 focus:ring-brand-400 accent-brand-500"
                    />
                    <span className="text-slate-700 dark:text-slate-350">
                      🛠️ {language === 'sw' ? 'Ujuzi wa Ziada Tu (Secondary)' : 'Secondary Specialty Only'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Map and Results */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Google Maps Visual Simulator */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '400px' }}>
                
                {/* Map Grid Simulator */}
                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center select-none" style={{ backgroundImage: darkMode ? 'radial-gradient(circle, #1e293b 1px, transparent 1px)' : 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                  
                  {/* Mock Roads / Landmarks */}
                  <div className="absolute w-[200%] h-1 bg-white dark:bg-slate-900 rotate-12 -translate-x-1/4"></div>
                  <div className="absolute w-[200%] h-1.5 bg-white dark:bg-slate-900 -rotate-45 -translate-x-1/4"></div>
                  <div className="absolute w-20 h-40 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-3xl -top-10 left-10 border border-emerald-500/10 flex items-center justify-center text-[9px] text-emerald-500 font-black tracking-widest uppercase">Mikocheni Park</div>
                  <div className="absolute w-40 h-20 bg-blue-500/10 dark:bg-blue-500/5 rounded-full -bottom-10 right-20 border border-blue-500/10"></div>
                  
                  <div className="absolute text-[8px] text-slate-450 dark:text-slate-500 top-1/3 left-1/4 rotate-12 font-bold uppercase tracking-wider">Bagamoyo Road</div>
                  <div className="absolute text-[8px] text-slate-455 dark:text-slate-550 bottom-1/3 right-1/4 -rotate-45 font-bold uppercase tracking-wider">Ali Hassan Mwinyi Road</div>

                  {/* Pulsing Radius Ring */}
                  <div 
                    className="absolute border-2 border-brand-500/35 dark:border-brand-500/25 bg-brand-500/5 rounded-full flex items-center justify-center pointer-events-none transition-all duration-300"
                    style={{ 
                      width: `${searchRadius * 25}px`, 
                      height: `${searchRadius * 25}px`,
                      maxWidth: '90%',
                      maxHeight: '90%'
                    }}
                  >
                    <span className="text-[10px] text-brand-500 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-brand-550/20 shadow-md transform -translate-y-8">{searchRadius} km</span>
                  </div>

                  {/* Animated Route Line */}
                  {routingPoints.length > 0 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Simulating simplified SVG coordinates */}
                      <path 
                        d={`M 50,50 Q 55,42 60,35`} // visual curve
                        fill="none" 
                        stroke="#0284c7" 
                        strokeWidth="2" 
                        strokeDasharray="4"
                        className="animate-[dash_2s_linear_infinite]"
                      />
                    </svg>
                  )}

                  {/* Customer Marker Pin */}
                  <div className="absolute z-20 flex flex-col items-center justify-center transform -translate-y-1/2">
                    <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center animate-ping absolute"></div>
                    <div className="w-5 h-5 bg-brand-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xl relative z-10">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-[9px] bg-slate-900/90 text-white font-bold px-2 py-0.5 rounded-lg shadow mt-1 relative z-10">Mimi (Wewe)</span>
                  </div>

                  {/* Fundi Pins */}
                  {fundis
                    .filter(f => {
                      if (searchProfession === 'all') return true;
                      const selectedName = MOCK_PROFESSIONS.find(p => p.id === searchProfession)?.nameEn;
                      if (!selectedName) return true;
                      
                      const isPrimMatch = (f.primaryProfession || f.profession) === selectedName;
                      const isSecMatch = f.secondaryProfessions 
                        ? f.secondaryProfessions.includes(selectedName)
                        : (f.professions ? f.professions.filter((x: string) => x !== f.profession).includes(selectedName) : false);
                      
                      if (filterPrimaryOnly) return isPrimMatch;
                      if (filterOtherSkills) return isSecMatch;
                      return isPrimMatch || isSecMatch || (f.professions ? f.professions.includes(selectedName) : f.profession === selectedName);
                    })
                    .map(f => {
                      const dist = calculateDistance(customerLocation.latitude, customerLocation.longitude, f.latitude, f.longitude);
                      const isVisible = dist <= searchRadius;

                      // Map relative positions based on coordinate delta
                      const topOffset = 50 + (f.latitude - customerLocation.latitude) * 2000;
                      const leftOffset = 50 + (f.longitude - customerLocation.longitude) * 2000;

                      return (
                        <button
                          key={f.id}
                          onClick={() => {
                            if (!isVisible) return;
                            setSelectedMapFundi(f);
                            simulateRoute(f.latitude, f.longitude);
                          }}
                          className={`absolute z-25 flex flex-col items-center transition-all duration-500 ${
                            isVisible ? 'scale-100 opacity-100 pointer-events-auto hover:z-30' : 'scale-50 opacity-10 pointer-events-none'
                          }`}
                          style={{ top: `${topOffset}%`, left: `${leftOffset}%` }}
                        >
                          <div className={`p-1 rounded-full border-2 bg-white shadow-xl hover:scale-110 transition-transform ${
                            selectedMapFundi?.id === f.id ? 'border-brand-550 border-brand-500 scale-110' : 'border-slate-300'
                          }`}>
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs text-slate-700">
                              {f.fullName.charAt(0)}
                            </div>
                          </div>
                          {f.verified && (
                            <div className="bg-brand-500 text-white p-0.5 rounded-full absolute -top-1 -right-1 border border-white">
                              <ShieldCheck className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <span className="text-[8px] bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 px-1.5 py-0.5 rounded shadow-sm font-extrabold mt-1">{f.fullName.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                </div>

                {/* Google Maps Logo / Watermark */}
                <div className="relative z-10 flex items-center space-x-1 text-[10px] text-slate-400/80 bg-white/60 dark:bg-slate-900/60 w-fit p-1 px-2.5 rounded-lg border border-slate-200/30">
                  <Map className="w-3.5 h-3.5" />
                  <span>Google Maps Simulation</span>
                </div>

                {/* Selected Marker Detail Card */}
                {selectedMapFundi && (
                  <div className="relative z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-2xl max-w-sm animate-slideUp space-y-3.5 mt-auto">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 bg-brand-100 rounded-full flex items-center justify-center font-black text-brand-600">
                          {selectedMapFundi.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{selectedMapFundi.fullName}</h4>
                            {selectedMapFundi.verified && <ShieldCheck className="w-3.5 h-3.5 text-brand-500 animate-pulse" />}
                          </div>
                          <span className="text-xs text-slate-455 dark:text-slate-400 font-medium">{selectedMapFundi.profession}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-brand-500 block">TZS {selectedMapFundi.price.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-bold block">{calculateDistance(customerLocation.latitude, customerLocation.longitude, selectedMapFundi.latitude, selectedMapFundi.longitude)} km away</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-850 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-250">{selectedMapFundi.rating}</span>
                        <span className="text-slate-400">({selectedMapFundi.reviewsCount} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        <span>ETA: <span className="font-bold text-slate-800 dark:text-slate-150">{Math.round(calculateDistance(customerLocation.latitude, customerLocation.longitude, selectedMapFundi.latitude, selectedMapFundi.longitude) * 2.5)} mins</span></span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-1 text-xs">
                      <button 
                        onClick={() => {
                          setSelectedFundi(selectedMapFundi);
                        }}
                        className="flex-1 bg-slate-150 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold py-2 rounded-xl text-slate-700 dark:text-slate-200 transition-all text-center"
                      >
                        Ukurasa Kamili (Profile)
                      </button>
                      <button 
                        onClick={() => handleStartChatWithFundi(selectedMapFundi)}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all text-center flex items-center justify-center"
                        title="Chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <a 
                        href={`tel:${selectedMapFundi.id === 'f1' ? '+255755667788' : '+255765432100'}`}
                        className="bg-emerald-500 hover:bg-emerald-650 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center justify-center"
                        title="Piga Simu Moja kwa Moja"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Nearby list side board */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 max-h-[500px] overflow-y-auto">
                <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Orodha ya Mafundi (Nearby Search)</h3>
                <div className="space-y-3.5">
                  {fundis
                    .filter(f => {
                      if (searchProfession === 'all') return true;
                      const selectedName = MOCK_PROFESSIONS.find(p => p.id === searchProfession)?.nameEn;
                      if (!selectedName) return true;
                      
                      const isPrimMatch = (f.primaryProfession || f.profession) === selectedName;
                      const isSecMatch = f.secondaryProfessions 
                        ? f.secondaryProfessions.includes(selectedName)
                        : (f.professions ? f.professions.filter((x: string) => x !== f.profession).includes(selectedName) : false);
                      
                      if (filterPrimaryOnly) return isPrimMatch;
                      if (filterOtherSkills) return isSecMatch;
                      return isPrimMatch || isSecMatch || (f.professions ? f.professions.includes(selectedName) : f.profession === selectedName);
                    })
                    .map(f => {
                      const dist = calculateDistance(customerLocation.latitude, customerLocation.longitude, f.latitude, f.longitude);
                      const isVisible = dist <= searchRadius;

                      return (
                        <div 
                          key={f.id}
                          className={`p-4 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-brand-500/50 hover:shadow transition-all ${
                            !isVisible ? 'opacity-40 hover:opacity-70' : 'relative border-l-4 border-l-brand-500'
                          }`}
                          onClick={() => {
                            setSelectedMapFundi(f);
                            simulateRoute(f.latitude, f.longitude);
                          }}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <span className="font-bold text-xs">{f.fullName}</span>
                              {f.verified && <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />}
                            </div>
                            <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>{f.rating} ({f.reviewsCount})</span>
                              <span>•</span>
                              <span>{f.online ? 'Online' : 'Offline'}</span>
                            </div>
                          </div>

                          <div className="text-right text-xs">
                            <span className="font-black text-slate-700 dark:text-slate-200 block">{dist} km</span>
                            <span className="text-[10px] text-slate-400 font-semibold block">{Math.round(dist * 2.5)} mins away</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* 4. DEDICATED UNIFIED REGISTER & BECOME A FUNDI PAGE */}
        {(currentPath === 'become-fundi' || currentPath === ('register' as any)) && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black bg-gradient-to-r from-brand-500 to-cyan-500 bg-clip-text text-transparent">Ukurasa wa Usajili (Sign Up Portal)</h1>
              <p className="text-xs text-slate-455">Chagua aina ya akaunti unayotaka kusajili ili uanze kutumia huduma zetu.</p>
            </div>

            {/* TAB HEADERS FOR ACCOUNT TYPE */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 space-x-6 text-xs font-bold uppercase tracking-wider justify-center">
              <button 
                onClick={() => setActiveRegisterTab('customer')}
                className={`pb-2 transition-all ${activeRegisterTab === 'customer' ? 'border-b-2 border-brand-500 text-brand-500' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Mteja (Customer)
              </button>
              <button 
                onClick={() => setActiveRegisterTab('company')}
                className={`pb-2 transition-all ${activeRegisterTab === 'company' ? 'border-b-2 border-brand-500 text-brand-500' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Kampuni (Company)
              </button>
              <button 
                onClick={() => {
                  setActiveRegisterTab('fundi');
                  setWizardStep(1);
                }}
                className={`pb-2 transition-all ${activeRegisterTab === 'fundi' ? 'border-b-2 border-brand-500 text-brand-500' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Fundi Wetu (Professional)
              </button>
            </div>

            {/* CUSTOMER REGISTER FORM */}
            {activeRegisterTab === 'customer' && (
              <form onSubmit={handleCustomerSignupSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400">Jina Kamili (Full Name)</label>
                  <input 
                    type="text" 
                    required 
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Amina Selemani" 
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Barua Pepe (Email Address)</label>
                  <input 
                    type="email" 
                    required 
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="customer@example.com" 
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Namba ya Simu (Phone Number)</label>
                  <input 
                    type="text" 
                    required 
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="0766239486" 
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400">Nenosiri (Password)</label>
                    <input 
                      type="password" 
                      required 
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Thibitisha Nenosiri</label>
                    <input 
                      type="password" 
                      required 
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <PrimaryButton type="submit" className="w-full py-3">
                  Sajili Akaunti ya Mteja (Register Customer)
                </PrimaryButton>
              </form>
            )}

            {/* COMPANY REGISTER FORM */}
            {activeRegisterTab === 'company' && (
              <form onSubmit={handleCompanySignupSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400">Jina la Kampuni (Company Name)</label>
                  <input 
                    type="text" 
                    required 
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Acme Contractors Ltd" 
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400">Namba ya TIN ya Kampuni</label>
                    <input 
                      type="text" 
                      required 
                      value={signupCompanyTin}
                      onChange={(e) => setSignupCompanyTin(e.target.value)}
                      placeholder="e.g. 110-344-998" 
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Sekta ya Kazi (Business Sector)</label>
                    <input 
                      type="text" 
                      required 
                      value={signupCompanySector}
                      onChange={(e) => setSignupCompanySector(e.target.value)}
                      placeholder="e.g. Civil & Construction Works" 
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Barua Pepe ya Biashara (Corporate Email)</label>
                  <input 
                    type="email" 
                    required 
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="info@acmecontractors.co.tz" 
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Namba ya Simu ya Ofisi</label>
                  <input 
                    type="text" 
                    required 
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="0766239486" 
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400">Nenosiri (Password)</label>
                    <input 
                      type="password" 
                      required 
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Thibitisha Nenosiri</label>
                    <input 
                      type="password" 
                      required 
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <PrimaryButton type="submit" className="w-full py-3">
                  Sajili Akaunti ya Kampuni (Register Corporate)
                </PrimaryButton>
              </form>
            )}

            {/* FUNDI MULTI-STEP REGISTRATION WIZARD */}
            {activeRegisterTab === 'fundi' && (
              <form onSubmit={handleRegisterFundiSubmit} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400">Jina Kamili ya Fundi</label>
                    <input 
                      type="text" 
                      required 
                      value={fundiForm.fullName}
                      onChange={(e) => setFundiForm({...fundiForm, fullName: e.target.value})}
                      placeholder="e.g. Juma Shabaan" 
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Namba ya Kitambulisho cha NIDA (20 Digits)</label>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        required 
                        value={fundiForm.nationalId}
                        onChange={(e) => setFundiForm({...fundiForm, nationalId: e.target.value})}
                        placeholder="19900812XXXXXXXXXXXXXXXX" 
                        className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={handleNidaVerify}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-[10px] px-3.5 py-2.5 rounded-xl transition-all shadow active:scale-95 flex items-center justify-center shrink-0"
                      >
                        Uhakiki (Verify)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400">Barua Pepe ya Fundi</label>
                    <input 
                      type="email" 
                      required 
                      value={fundiForm.email || ''}
                      onChange={(e) => setFundiForm({...fundiForm, email: e.target.value})}
                      placeholder="juma@example.com" 
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Namba ya Simu ya Fundi</label>
                    <input 
                      type="text" 
                      required 
                      value={fundiForm.phone || ''}
                      onChange={(e) => setFundiForm({...fundiForm, phone: e.target.value})}
                      placeholder="0766239486" 
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400">Nenosiri (Password)</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Thibitisha Nenosiri</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
                  <h4 className="font-extrabold text-[11px] text-brand-500 uppercase tracking-wider">Taaluma na Ujuzi (Profession & Skills)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Taaluma Kuu (Primary Profession)</label>
                      <select 
                        value={fundiForm.primaryProfession}
                        onChange={(e) => setFundiForm({ ...fundiForm, primaryProfession: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                      >
                        <option value="">-- Chagua Kazi Kuu --</option>
                        {MOCK_PROFESSIONS.map(p => (
                          <option key={p.id} value={p.nameEn}>{p.nameSw}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Lugha Unazozungumza (Languages)</label>
                      <input 
                        type="text" 
                        value={fundiForm.languagesSpoken}
                        onChange={(e) => setFundiForm({...fundiForm, languagesSpoken: e.target.value})}
                        placeholder="e.g. Kiswahili, Kiingereza" 
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

              {/* Searchable Multi-Select Profession Dropdown Component */}
              <div className="space-y-2">
                <label className="text-slate-400 block font-bold">Taaluma / Kazi Maalum (Professions - Select all that apply)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tafuta taaluma hapa... (e.g. Solar, Welder, CCTV)"
                    value={professionSearchQuery}
                    onChange={(e) => setProfessionSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none pl-10 pr-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-105"
                  />
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MOCK_PROFESSIONS.filter(p => 
                    p.nameEn.toLowerCase().includes(professionSearchQuery.toLowerCase()) || 
                    p.nameSw.toLowerCase().includes(professionSearchQuery.toLowerCase())
                  ).map(p => {
                    const isChecked = fundiForm.professions.includes(p.nameEn);
                    return (
                      <label 
                        key={p.id} 
                        className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updated = isChecked
                              ? fundiForm.professions.filter(item => item !== p.nameEn)
                              : [...fundiForm.professions, p.nameEn];
                            setFundiForm({ ...fundiForm, professions: updated });
                          }}
                          className="w-4 h-4 rounded text-brand-500 border-slate-350 focus:ring-brand-400 accent-brand-500"
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-200 font-bold select-none flex items-center space-x-2">
                          <p.icon className="w-4 h-4 text-slate-400" />
                          <span>{language === 'sw' ? p.nameSw : p.nameEn}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {fundiForm.professions.length === 0 && (
                  <p className="text-[10px] text-red-500 font-bold">Chagua angalau taaluma moja kuendelea.</p>
                )}
              </div>

              {fundiForm.professions.length > 0 && (
                <div className="space-y-1.5 p-4 border border-brand-500/20 bg-brand-500/5 rounded-2xl animate-fadeIn">
                  <label className="text-brand-500 block font-black">
                    {language === 'sw' ? 'Ni ipi kati ya hizi ndiyo kazi yako kuu? (Main Profession)' : 'Which of these is your main profession?'}
                  </label>
                  <select
                    value={fundiForm.primaryProfession}
                    onChange={(e) => setFundiForm({ ...fundiForm, primaryProfession: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="">-- {language === 'sw' ? 'Chagua Kazi Kuu' : 'Select Main Profession'} --</option>
                    {fundiForm.professions.map((profName: string) => {
                      const matched = MOCK_PROFESSIONS.find(p => p.nameEn === profName);
                      return (
                        <option key={profName} value={profName}>
                          {language === 'sw' ? matched?.nameSw : matched?.nameEn}
                        </option>
                      );
                    })}
                  </select>
                  {!fundiForm.primaryProfession && (
                    <p className="text-[10px] text-red-500 font-bold">Tafadhali chagua kazi yako kuu.</p>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-400">Ujuzi Maalum (Skills separated by commas)</label>
                <input 
                  type="text" 
                  value={fundiForm.skills}
                  onChange={(e) => setFundiForm({...fundiForm, skills: e.target.value})}
                  placeholder="e.g. Leak Detection, Piping Layouts, Water Pump Repairs" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">Uzoefu (Miaka ya Kazi)</label>
                  <input 
                    type="number" 
                    value={fundiForm.experience}
                    onChange={(e) => setFundiForm({...fundiForm, experience: e.target.value})}
                    placeholder="e.g. 5" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Elimu / Ufuzu (Education Background)</label>
                  <input 
                    type="text" 
                    value={fundiForm.education}
                    onChange={(e) => setFundiForm({...fundiForm, education: e.target.value})}
                    placeholder="e.g. VETA Cheti ngazi ya 3" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Radius ya Kazi (km)</label>
                  <input 
                    type="number" 
                    value={fundiForm.workingRadius}
                    onChange={(e) => setFundiForm({...fundiForm, workingRadius: e.target.value})}
                    placeholder="15" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">Mkoa (Region)</label>
                  <select 
                    value={fundiForm.region}
                    onChange={(e) => setFundiForm({...fundiForm, region: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  >
                    <option value="Dar es Salaam">Dar es Salaam</option>
                    <option value="Pwani">Pwani</option>
                    <option value="Morogoro">Morogoro</option>
                    <option value="Arusha">Arusha</option>
                    <option value="Mwanza">Mwanza</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Wilaya (District)</label>
                  <select 
                    value={fundiForm.district}
                    onChange={(e) => setFundiForm({...fundiForm, district: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  >
                    <option value="Kinondoni">Kinondoni</option>
                    <option value="Ilala">Ilala</option>
                    <option value="Temeke">Temeke</option>
                    <option value="Ubungo">Ubungo</option>
                    <option value="Kigamboni">Kigamboni</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Kata (Ward)</label>
                  <select 
                    value={fundiForm.ward}
                    onChange={(e) => setFundiForm({...fundiForm, ward: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  >
                    <option value="Mikocheni">Mikocheni</option>
                    <option value="Sinza">Sinza</option>
                    <option value="Kijitonyama">Kijitonyama</option>
                    <option value="Mwananyamala">Mwananyamala</option>
                    <option value="Kawe">Kawe</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Mtaa (Street)</label>
                  <input 
                    type="text" 
                    value={fundiForm.street}
                    onChange={(e) => setFundiForm({...fundiForm, street: e.target.value})}
                    placeholder="Sinza A" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-slate-400">Warranty ya Huduma</label>
                  <select 
                    value={fundiForm.warranty}
                    onChange={(e) => setFundiForm({...fundiForm, warranty: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100"
                  >
                    <option value="7 Days">7 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3.5 pt-4">
                  <input 
                    type="checkbox" 
                    id="emergencyService"
                    checked={fundiForm.emergencyService}
                    onChange={(e) => setFundiForm({...fundiForm, emergencyService: e.target.checked})}
                    className="w-4 h-4 rounded text-brand-500 border-slate-350 focus:ring-brand-400 accent-brand-500"
                  />
                  <label htmlFor="emergencyService" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                    Niko tayari kutoa huduma za dharura za 24/7 (Emergency Service)
                  </label>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-2xl p-5 bg-slate-50 dark:bg-slate-850/50 space-y-4">
                <h4 className="font-extrabold text-[11px] text-slate-455 uppercase tracking-wider">Hati za Uhakiki (Verification Files)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">NIDA ID Card Copy</span>
                    <input 
                      type="file" 
                      onChange={(e) => setFundiForm({...fundiForm, nidaFile: e.target.value})}
                      className="w-full text-slate-455 text-[10px]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">Leseni ya Kazi / Cheti cha VETA</span>
                    <input 
                      type="file" 
                      onChange={(e) => setFundiForm({...fundiForm, licenseFile: e.target.value})}
                      className="w-full text-slate-455 text-[10px]" 
                    />
                  </div>
                </div>
              </div>

              <PrimaryButton 
                type="submit" 
                className="w-full py-3.5"
              >
                Kamilisha Usajili wa Fundi & Nenda kwenye Dashboard
              </PrimaryButton>
            </form>
            )}
          </div>
        )}

        {/* 5. DOWNLOAD APP PAGE */}
        {currentPath === 'download' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn text-slate-800 dark:text-slate-100">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h1 className="text-3xl font-black bg-gradient-to-r from-brand-600 to-cyan-500 bg-clip-text text-transparent">Pakua App ya Fundi Service</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Pata huduma ya uhakika na malipo salama ya Escrow kwenye simu yako ya mkononi. Fuatilia eneo la mafundi kwa GPS na utume ujumbe kwa urahisi zaidi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {/* Customer App Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-md flex flex-col justify-between space-y-6 hover:shadow-xl transition-all">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-brand-500/15 text-brand-500 p-3.5 rounded-2xl">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base">Customer Mobile App</h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">KWA AJILI YA WATEJA</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Tafuta mafundi wa karibu, kagua makadirio ya bei ya AI, dhibiti wallet yako na uajiri mafundi kwa usalama.
                  </p>

                  <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 text-xs font-semibold space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Toleo la Sasa:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">v{customerVersion.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ukubwa wa Faili:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{customerVersion.fileSizeMb} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mahitaji ya Android:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{customerVersion.androidMinRequirement}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Mabadiliko / Release Notes:</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">{customerVersion.releaseNotes}</p>
                    </div>
                  </div>
                </div>

                <a 
                  href={customerVersion.downloadUrl}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-all text-center uppercase flex items-center justify-center space-x-2 w-full hover:scale-[1.02]"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Customer APK</span>
                </a>
              </div>

              {/* Fundi App Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-md flex flex-col justify-between space-y-6 hover:shadow-xl transition-all">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-500/15 text-emerald-500 p-3.5 rounded-2xl">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base">Fundi Workspace App</h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">KWA AJILI YA MAFUNDI</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Pokea maombi ya kazi (dispatch wave), wasilisha nukuu za bei (bids), fuatilia maelekezo ya GPS, na dhibiti mapato yako.
                  </p>

                  <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 text-xs font-semibold space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Toleo la Sasa:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">v{fundiVersion.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ukubwa wa Faili:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{fundiVersion.fileSizeMb} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mahitaji ya Android:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{fundiVersion.androidMinRequirement}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Mabadiliko / Release Notes:</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">{fundiVersion.releaseNotes}</p>
                    </div>
                  </div>
                </div>

                <a 
                  href={fundiVersion.downloadUrl}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-all text-center uppercase flex items-center justify-center space-x-2 w-full hover:scale-[1.02]"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Fundi APK</span>
                </a>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 text-center max-w-xl mx-auto space-y-2.5">
              <span className="font-extrabold text-xs text-brand-500 uppercase tracking-widest block">Ufungaji Salama na wa Haraka</span>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed font-semibold">
                Kabla ya kuweka faili la APK, tafadhali hakikisha umeruhusu "Install from Unknown Sources" kwenye mipangilio (Settings) ya simu yako ya Android.
              </p>
            </div>
          </div>
        )}
        {/* 6. PUBLIC ABOUT US */}
        {currentPath === 'about' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn py-6 px-4 selection:bg-brand-500 selection:text-white">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-black bg-gradient-to-r from-brand-500 to-cyan-500 bg-clip-text text-transparent">Kuhusu Sisi (About Us)</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-semibold">
                Jukwaa la kwanza la mafundi na wataalamu nchini Tanzania lenye uhakiki kamili, bima ya dhamana (Warranty), na malipo salama ya Escrow.
              </p>
            </div>

            {/* COMPANY STORY */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-black flex items-center space-x-2">
                <span className="bg-brand-500/10 text-brand-500 p-2 rounded-xl"><Compass className="w-5 h-5" /></span>
                <span>Historia yetu (Our Story)</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Nia ya kuanzisha Fundi Service ilizaliwa mwaka 2025 baada ya kuona changamoto kubwa ya wateja kupata mafundi waaminifu na wenye ujuzi stahiki, pamoja na changamoto za mafundi kutolipwa kwa wakati baada ya kukamilisha kazi zao vizuri. Tuliunda jukwaa hili ili kuwa kiunganishi cha uaminifu kinachohakikisha kila upande unapata haki yake kwa uadilifu wa hali ya juu.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl">
                  <h4 className="font-extrabold text-xs text-brand-550 mb-1">Dira Yetu (Vision)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Kuwa soko kuu la kidijitali linaloaminika na kuheshimika zaidi kwa huduma za mafundi na mafundi sanifu kote Afrika Mashariki.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl">
                  <h4 className="font-extrabold text-xs text-emerald-550 mb-1">Dhamira Yetu (Mission)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Kuinua viwango vya huduma kupitia uthibitishaji makini, dhamana ya ubora, na kuwajengea uwezo mafundi wa ndani kifedha na kitaaluma.</p>
                </div>
              </div>
            </div>

            {/* CORE VALUES */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider text-center">Maadili Yetu ya Msingi (Core Values)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">1. Uaminifu (Trust)</h4>
                  <p className="text-[11px] text-slate-500">Kila malipo yapo salama kupitia mifumo yetu ya Escrow hadi kazi ikamilike kikamilifu.</p>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">2. Ubora (Quality)</h4>
                  <p className="text-[11px] text-slate-500">Usaidizi wa dhamana za kiufundi (Warranties) kwa kila kazi inayofanyika kupitia jukwaa letu.</p>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">3. weledi (Professionalism)</h4>
                  <p className="text-[11px] text-slate-500">Uhakiki kamili wa vyeti vya kitaaluma ikiwemo VETA kwa wataalamu wetu wote.</p>
                </div>
              </div>
            </div>

            {/* VETTING AND WARRANTY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3 shadow-sm">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Uhakiki na Vetting ya Mafundi</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tunakagua vitambulisho vya NIDA, Tin, Cheti cha VETA, picha ya uso (Facial verification), na tunafanya mahojiano ya ana kwa ana na kila fundi ili kuhakikisha usalama wako na wa mali zako.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3 shadow-sm">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Dhamana (Warranty Guarantee)</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Huna haja ya kuwa na wasiwasi ikiwa tatizo litajirudia. Mfumo wetu unasaidia kutoa warranty ya siku 7 hadi mwaka 1 kulingana na aina ya matengenezo, yote yakiwa yameandikwa kwenye cheti maalum.
                </p>
              </div>
            </div>

            {/* TEAM */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Timu Yetu ya Kitaalamu (Professional Team)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-100 dark:bg-slate-900 p-5 rounded-2xl text-center space-y-2 border border-slate-200/50 dark:border-slate-800">
                  <div className="w-16 h-16 bg-brand-500/10 text-brand-500 mx-auto rounded-full flex items-center justify-center font-bold text-lg"><Users className="w-8 h-8" /></div>
                  <h4 className="font-extrabold text-xs">Eng. Segule Segule</h4>
                  <p className="text-[10px] text-slate-400">Founder & Principal Systems Architect</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 p-5 rounded-2xl text-center space-y-2 border border-slate-200/50 dark:border-slate-800">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 mx-auto rounded-full flex items-center justify-center font-bold text-lg"><Users className="w-8 h-8" /></div>
                  <h4 className="font-extrabold text-xs">Sofia Ibrahim</h4>
                  <p className="text-[10px] text-slate-400">Chief Verification Officer</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 p-5 rounded-2xl text-center space-y-2 border border-slate-200/50 dark:border-slate-800">
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-500 mx-auto rounded-full flex items-center justify-center font-bold text-lg"><Users className="w-8 h-8" /></div>
                  <h4 className="font-extrabold text-xs">Dr. Selemani Juma</h4>
                  <p className="text-[10px] text-slate-400">Marketplace Risk Specialist</p>
                </div>
              </div>
            </div>

            {/* FAQS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-black">Maswali Yanayoulizwa Mara kwa Mara (FAQs)</h3>
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <h4 className="text-slate-800 dark:text-slate-200 flex items-center space-x-1.5"><HelpCircle className="w-4 h-4 text-brand-500" /> <span>Escrow inafanyaje kazi?</span></h4>
                  <p className="text-slate-500 leading-relaxed pl-5 font-normal">Wakati unakubali bei, pesa zako zinashikiliwa na jukwaa letu kama amana salama. Mara tu fundi anapomaliza kazi na wewe ukathibitisha kuwa imekamilika vizuri, ndipo tunapomwachia fundi pesa zake.</p>
                </div>
                <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <h4 className="text-slate-800 dark:text-slate-200 flex items-center space-x-1.5"><HelpCircle className="w-4 h-4 text-brand-500" /> <span>Nini kitatokea kama fundi amefanya kazi chini ya viwango?</span></h4>
                  <p className="text-slate-500 leading-relaxed pl-5 font-normal">Unaweza kufungua mgogoro (Dispute) kwenye mfumo. Timu yetu ya wakaguzi itakuja kukagua na kama fundi amefeli, pesa zako zitarudishwa kwenye Wallet yako au fundi mwingine atatumwa bila gharama yoyote.</p>
                </div>
                <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <h4 className="text-slate-800 dark:text-slate-200 flex items-center space-x-1.5"><HelpCircle className="w-4 h-4 text-brand-500" /> <span>VETA Verified Badge inamaanisha nini?</span></h4>
                  <p className="text-slate-500 leading-relaxed pl-5 font-normal">Inamaanisha fundi huyo amewasilisha cheti chake cha Chuo cha Veta au chuo kinachotambuliwa na kimepita kwenye uhakiki wa kina wa timu yetu ya usalama.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PUBLIC CONTACT US PAGE */}
        {currentPath === ('contact' as any) && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn py-6 px-4 selection:bg-brand-500 selection:text-white">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-black bg-gradient-to-r from-brand-500 to-cyan-500 bg-clip-text text-transparent">Wasiliana Nasi (Contact Us)</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-semibold">
                Una maswali au maoni? Timu yetu ya huduma kwa wateja ipo tayari kukusaidia masaa 24/7.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info & Forms */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Tuma Ujumbe (Send Message)</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  alert('Asante kwa ujumbe wako! Tutajibu hivi punde.');
                }} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-slate-400">Jina Lako kamili</label>
                    <input type="text" required placeholder="Amina Selemani" className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Namba ya Simu / Email</label>
                    <input type="text" required placeholder="0766239486" className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Ujumbe wako</label>
                    <textarea rows={4} required placeholder="Eleza kwa ufupi hoja yako hapa..." className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100" />
                  </div>
                  <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md">Tuma Ujumbe</button>
                </form>
              </div>

              {/* Company Details & Channels */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-sm">Maelezo ya Mawasiliano</h4>
                  <div className="space-y-3 text-xs font-semibold text-slate-500 leading-relaxed">
                    <div className="flex items-center space-x-3 text-slate-800 dark:text-slate-200">
                      <PhoneCall className="w-4 h-4 text-brand-500" />
                      <span>0766239486 (Simu / Tigo Pesa / M-Pesa)</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-800 dark:text-slate-200">
                      <Mail className="w-4 h-4 text-brand-500" />
                      <span>segulesegule3@gmail.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Saa za kazi: Jumatatu - Jumapili (Masaa 24)</span>
                    </div>
                    <div className="flex items-center space-x-3 text-red-500 font-bold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Namba ya Dharura: 0766239486 (Emergency Line)</span>
                    </div>
                  </div>
                  
                  {/* WhatsApp click integration */}
                  <a 
                    href="https://wa.me/255766239486" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center space-x-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 rounded-xl transition-all shadow-md text-xs"
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                    <span>Tuma Ujumbe WhatsApp</span>
                  </a>
                </div>

                {/* Google Maps Placeholder */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-xs flex items-center space-x-1.5"><MapPin className="w-4 h-4 text-brand-500" /> <span>Ofisi Zetu (Google Maps Locator)</span></h4>
                  <div className="w-full h-40 bg-slate-100 dark:bg-slate-850 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Oysterbay Office Plaza, Dar es Salaam, TZ</span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/5 to-cyan-500/5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. UNIFIED DASHBOARD SYSTEM (CUSTOMER & FUNDI) */}
        {currentPath === 'dashboard' && currentUser && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-black">Akaunti ya {currentUser.fullName}</h1>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Jukumu lako katika Mfumo: <span className="text-brand-500 font-extrabold">{currentUser.role === 'verification_officer' ? 'ADMIN OFFICER' : currentUser.role.toUpperCase()}</span></p>
              </div>

              {currentUser.role === 'customer' && (
                <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center space-x-4">
                  <div className="text-xs font-bold text-slate-400">Escrow Wallet Balance:</div>
                  <div className="text-lg font-black text-brand-650 dark:text-brand-400">TZS {walletBalance.toLocaleString()}</div>
                </div>
              )}
            </div>

            {/* C. COMPANY ACCOUNT DASHBOARD VIEWS */}
            {currentUser.role === 'company' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Dashibodi ya Kampuni (Company Portal)</h3>
                    <p className="text-xs text-slate-400 font-semibold">Usimamizi wa Kandarasi, Wasifu wa Biashara na Zabuni za Mafundi.</p>
                  </div>
                  <span className="bg-brand-500/10 text-brand-500 border border-brand-500/20 text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider self-start sm:self-auto">Mwanachama Verified (Corporate)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider text-brand-500">Taarifa Kuu za Biashara</h4>
                    <div className="space-y-2 text-slate-655 dark:text-slate-350">
                      <p>Jina la Biashara: <span className="font-extrabold text-slate-800 dark:text-slate-100">Acme Contractors Ltd</span></p>
                      <p>Namba ya TIN ya Usajili: <span className="font-extrabold text-slate-800 dark:text-slate-100">110-344-998</span></p>
                      <p>Sekta Kuu ya Biashara: <span className="font-extrabold text-slate-800 dark:text-slate-100">Civil & Structural Works</span></p>
                      <p>Barua Pepe ya Ofisi: <span className="font-extrabold text-slate-800 dark:text-slate-100">{currentUser.email || 'info@acmecontractors.co.tz'}</span></p>
                      <p>Namba ya Simu: <span className="font-extrabold text-slate-800 dark:text-slate-100">{currentUser.phoneNumber || '0766239486'}</span></p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider text-brand-500">Ripoti ya Kazi & Zabuni (Overview)</h4>
                    <div className="space-y-2.5 text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <span>Kandarasi Mpya (Bids Submitted):</span>
                        <span className="font-black text-brand-500 text-sm">2 Pending</span>
                      </div>
                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <span>Mafundi Washirika Walio Kazini:</span>
                        <span className="font-black text-brand-500 text-sm">5 Active</span>
                      </div>
                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <span>Jumla ya Zabuni Kazi:</span>
                        <span className="font-black text-brand-500 text-sm">TZS 12,000,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* A. CUSTOMER DASHBOARD VIEWS */}
            {currentUser.role === 'customer' && (
              <div className="space-y-6">
                <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 space-x-6">
                  <button 
                    onClick={() => setCustomerTab('overview')} 
                    className={`pb-2 text-xs font-bold uppercase transition-all tracking-wider ${customerTab === 'overview' ? 'border-b-2 border-brand-500 text-brand-500' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Muhtasari wa Huduma (Overview)
                  </button>
                  <button 
                    onClick={() => setCustomerTab('warranties')} 
                    className={`pb-2 text-xs font-bold uppercase transition-all tracking-wider ${customerTab === 'warranties' ? 'border-b-2 border-brand-500 text-brand-500' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Hati za Udhamini & Madai (Warranties & Claims)
                  </button>
                </div>

                {customerTab === 'overview' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Bookings & Bids Left side */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Bookings lists */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Miadi na Matengenezo Yangu (Bookings)</h3>
                    
                    <div className="space-y-4">
                      {bookings.length === 0 ? (
                        <p className="text-xs text-slate-400">Huna booking yoyote iliyo hai kwa sasa.</p>
                      ) : (
                        bookings.map(b => (
                          <div key={b.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-sm">{b.fundi.fullName}</span>
                                <span className="bg-brand-50 hover:bg-brand-100 text-brand-550 border border-brand-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">{b.fundi.profession}</span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{b.description}</p>
                               <div className="text-[10px] text-slate-400 font-semibold space-y-1 mt-2 leading-relaxed">
                                 <p>Tarehe: {b.date}</p>
                                 <p>Njia ya Malipo (Payment Option): <span className="text-slate-700 dark:text-slate-350 font-bold uppercase">{b.paymentOption || 'online'}</span></p>
                                 <p>Salio la Escrow (Escrow Balance): <span className="text-brand-500 font-bold">TZS {b.paymentOption === 'offline' ? '0' : b.price.toLocaleString()}</span></p>
                                 <p>Hali ya Malipo (Payment Status): <span className={`font-bold ${b.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{b.paymentOption === 'offline' ? 'Lipa baada ya Kazi (Pay After Service)' : (b.status === 'completed' ? 'Imelipwa kwa Fundi' : 'Imeshikiliwa Escrow')}</span></p>
                                 {b.paymentOption !== 'offline' && (
                                   <p>Siku ya Kutoa Pesa (Release Date): <span className="text-slate-500 font-medium">{b.status === 'completed' ? 'Tayari Imeshatolewa' : 'Masaa 72 baada ya kazi kukamilika'}</span></p>
                                 )}
                               </div>
                             </div>

                            <div className="flex items-center space-x-2">
                              {b.status === 'PRICE_CONFIRMED' && (
                                <button 
                                  onClick={() => {
                                    setReviewFormBooking(b);
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all whitespace-nowrap"
                                >
                                  Kamilisha Kazi & Toa Review
                                </button>
                              )}
                              {b.status === 'completed' && (
                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-500/20 text-[10px] font-extrabold px-3.5 py-1.5 rounded-xl uppercase tracking-wider">Kazi Imekamilika</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quote Requests / Quotations submitted by fundis */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Bao la Nukuu za Bei (My Quote Requests & Bids)</h3>
                    
                    <div className="space-y-6">
                      {quoteRequests.filter(q => q.customerId === currentUser.id).length === 0 ? (
                        <p className="text-xs text-slate-400">Hujatuma ombi lolote la bei kwa sasa.</p>
                      ) : (
                        quoteRequests.filter(q => q.customerId === currentUser.id).map(req => (
                          <div key={req.id} className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-150">{req.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-semibold">{req.description}</p>
                                <span className="text-[10px] text-slate-400 block">Eneo: {req.location} • Bajeti ya Juu: TZS {req.budgetMax.toLocaleString()}</span>
                              </div>
                              <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg ${req.isActive ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                                {req.isActive ? 'INAPOKEA BEI' : 'IMEFUNGWA'}
                              </span>
                            </div>

                            {/* Bids received */}
                            <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nukuu za Bei zilizowasilishwa (Bids)</h5>
                              {req.bids.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic">Hakuna fundi aliyewasilisha nukuu ya bei kwa sasa.</p>
                              ) : (
                                req.bids.map((bid: any) => (
                                  <div key={bid.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3.5 shadow-sm">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center font-bold text-xs text-brand-600">
                                          {bid.fundiName.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="flex items-center space-x-1">
                                            <span className="font-bold text-xs">{bid.fundiName}</span>
                                            {bid.fundiVerified && <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />}
                                          </div>
                                          <div className="flex items-center space-x-1 text-[9px] text-slate-400">
                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                            <span>{bid.fundiRating}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-xs font-black text-brand-500 block">TZS {bid.quotationAmount.toLocaleString()}</span>
                                        <span className="text-[9px] text-slate-400 font-bold block">{bid.estimatedDuration} to complete</span>
                                      </div>
                                    </div>

                                    <div className="text-[10.5px] text-slate-500 leading-relaxed font-semibold">
                                      {bid.notes}
                                              <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 font-medium">
                                      <div>Udhamini (Warranty): <span className="font-bold text-slate-700 dark:text-slate-200">{bid.warrantyPeriod}</span></div>
                                      <div>Vifaa: <span className="font-bold text-slate-700 dark:text-slate-200">{bid.materialsIncluded ? 'Vimejumuishwa' : 'Labor tu'}</span></div>
                                    </div>
                                      
                                    {req.isActive && bid.status === 'pending' && (
                                      <div className="pt-2 space-y-3">
                                        <div className="flex justify-end space-x-2.5">
                                          <button 
                                            onClick={() => handleRejectBid(req.id, bid.id)}
                                            className="bg-red-50 hover:bg-red-105 text-red-600 border border-red-500/25 font-extrabold text-[10px] px-3.5 py-2 rounded-lg transition-all uppercase"
                                          >
                                            Kataa (Reject)
                                          </button>
                                          
                                          <button 
                                            onClick={() => {
                                              setCounterFormBidId(bid.id);
                                              setCounterPriceInput(bid.quotationAmount.toString());
                                            }}
                                            className="bg-slate-105 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 font-extrabold text-[10px] px-3.5 py-2 rounded-lg transition-all uppercase"
                                          >
                                            Mjadala wa Bei (Counter)
                                          </button>

                                          <button 
                                            onClick={() => handleAcceptBid(req.id, bid)}
                                            className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-[10px] px-4 py-2 rounded-lg shadow transition-all uppercase"
                                          >
                                            Kubali Bei (Accept & Lock)
                                          </button>
                                        </div>

                                        {/* Counter Offer Input Form */}
                                        {counterFormBidId === bid.id && (
                                          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3.5 animate-fadeIn">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                              <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400 font-bold block">Pendekeza Bei Mpya (TZS)</label>
                                                <input 
                                                  type="number"
                                                  value={counterPriceInput}
                                                  onChange={(e) => setCounterPriceInput(e.target.value)}
                                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none px-3 py-1.5 rounded-lg text-xs"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label className="text-[10px] text-slate-400 font-bold block">Ujumbe / Vidokezo (Optional)</label>
                                                <input 
                                                  type="text"
                                                  placeholder="e.g. Tafadhali punguza kidogo bei ya labor..."
                                                  value={counterNotesInput}
                                                  onChange={(e) => setCounterNotesInput(e.target.value)}
                                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none px-3 py-1.5 rounded-lg text-xs"
                                                />
                                              </div>
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                              <button 
                                                onClick={() => setCounterFormBidId(null)}
                                                className="text-slate-450 hover:text-slate-600 font-extrabold text-[10px] uppercase"
                                              >
                                                Ghairi
                                              </button>
                                              <button 
                                                onClick={() => handleProposeCounter(req.id, bid.id)}
                                                className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg"
                                              >
                                                Tuma Counter Offer
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}                            </div>

                                    {bid.status === 'PRICE_CONFIRMED' && (
                                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-500/20 text-[9px] font-extrabold px-3.5 py-1.5 rounded-lg uppercase tracking-wider block text-center">Umechagua hii</span>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Customer Chat & Quick Actions Right side */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Chat Session Box */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Mazungumzo (Active Chats)</h3>
                    
                    {/* List of chat threads */}
                    <div className="space-y-2 max-h-[160px] overflow-y-auto">
                      {chats.map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => setActiveChatId(c.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            activeChatId === c.id 
                              ? 'border-brand-500 bg-brand-50/10 dark:bg-brand-950/20' 
                              : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center font-bold text-xs text-brand-600 relative">
                              {c.partnerName.charAt(0)}
                              {c.onlineStatus && (
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                            <div className="text-xs">
                              <div className="font-bold flex items-center space-x-1">
                                <span>{c.partnerName}</span>
                                <span className="bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-[8px] font-bold text-slate-500 uppercase px-1 rounded">Fundi</span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate max-w-[130px] font-medium">{c.lastMessage}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat view */}
                    {activeChatId ? (
                      <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between" style={{ height: '300px' }}>
                        <div className="bg-slate-50 dark:bg-slate-850 p-3 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs">{chats.find(c => c.id === activeChatId)?.partnerName}</span>
                            <span className="text-[9px] text-slate-400">
                              {chats.find(c => c.id === activeChatId)?.onlineStatus ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          {isTypingSimulated && (
                            <span className="text-[8px] text-slate-455 font-bold animate-pulse">Anaandika...</span>
                          )}
                        </div>

                        {/* Messages panel */}
                        <div className="flex-grow p-3 overflow-y-auto space-y-2 bg-slate-50/50 text-[11px] font-semibold">
                          {chats.find(c => c.id === activeChatId)?.messages.map((m: any) => (
                            <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                              <div className={`p-2.5 rounded-2xl max-w-[85%] ${
                                m.senderId === currentUser.id 
                                  ? 'bg-brand-500 text-white rounded-tr-none' 
                                  : 'bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-250 rounded-tl-none'
                              }`}>
                                {m.text}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Chat input panel */}
                        <div className="p-2 border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-1">
                          <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Andika ujumbe hapa..."
                            className="flex-grow bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-[11px] px-3 py-2 rounded-xl"
                          />
                          <button 
                            onClick={handleSendMessage}
                            className="bg-brand-500 text-white p-2 rounded-xl shadow hover:bg-brand-650 transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 text-slate-400 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
                        Gusa ujumbe wowote juu ili uanze kuchat na fundi wako.
                      </div>
                    )}
                  </div>
                </div>

                {/* END OF OVERVIEW */}
                </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Hati za Udhamini na Madai (Warranty Hub)</h2>
                        <p className="text-xs text-slate-500 font-semibold">Tazama na pakua hati zako za udhamini au wasilisha madai ya marekebisho.</p>
                      </div>
                      <button 
                        onClick={() => {
                          const desc = prompt('Wasilisha dai la marekebisho ya kazi:');
                          if (desc) {
                            alert('Dai lako la udhamini limepokelewa na limetumwa kwa Fundi mara moja!');
                          }
                        }}
                        className="bg-brand-500 hover:bg-brand-655 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
                      >
                        + Wasilisha Dai Mpya (File Claim)
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {warranties.map(w => (
                        <div key={w.id} className="p-5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">{w.duration} Warranty</span>
                              <h3 className="font-extrabold text-slate-855 dark:text-slate-250 text-sm mt-1">{w.warrantyNumber}</h3>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">{new Date(w.startDate).toLocaleDateString()} to {new Date(w.expiryDate).toLocaleDateString()}</span>
                          </div>

                          <div className="text-xs text-slate-500 space-y-1 font-semibold leading-relaxed">
                            <p><span className="text-slate-400">Jina la Fundi:</span> {w.fundiName}</p>
                            <p><span className="text-slate-450">Kazi Iliyofanyika:</span> {w.bookingDescription}</p>
                          </div>

                          <div className="flex space-x-2.5 pt-2">
                            <a 
                              href={`/api/warranties/${w.id}/download-pdf`}
                              download 
                              className="flex-1 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-750 font-extrabold text-[10px] py-2 rounded-xl transition-all uppercase"
                            >
                              Pakua Certificate (PDF)
                            </a>
                            <button 
                              onClick={() => {
                                alert(`QR Verification Code kwa Hati hii:\nLink: ${w.qrCodeData}`);
                              }}
                              className="bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-400 text-brand-600 font-extrabold text-[10px] px-4 py-2 rounded-xl transition-all uppercase"
                            >
                              Hakiki QR
                            </button>
                          </div>

                          {w.claims.length > 0 && (
                            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
                              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Historia ya Madai (Claims History)</h4>
                              {w.claims.map((c: any) => (
                                <div key={c.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center">
                                  <div className="text-xs font-bold text-slate-700 dark:text-slate-350">
                                    <p>{c.description}</p>
                                    <span className="text-[9px] text-slate-400 font-semibold">{c.createdAt}</span>
                                  </div>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    c.status === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 border border-amber-200' :
                                    c.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200' :
                                    'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 border border-red-200'
                                  }`}>{c.status}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* C. CORPORATE ACCOUNT MANAGEMENT VIEWS */}
            {currentUser.role === 'corporate' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Portal ya Biashara na Mashirika (Corporate Portal)</h2>
                    <p className="text-xs text-slate-500 font-semibold">Kampuni: Acme Services Ltd • TIN: 110-344-998 • Hali: Akaunti Imethibitishwa</p>
                  </div>
                  <button 
                    onClick={() => {
                      const name = prompt('Jina kamili la mfanyakazi:');
                      const phone = prompt('Namba ya simu ya mfanyakazi:');
                      if (name && phone) {
                        showNotification(`Mfanyakazi ${name} amealikwa kwa mafanikio!`);
                      }
                    }}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
                  >
                    + Mfanyakazi Mpya (Invite Employee)
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Employee section */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Wafanyakazi Waliounganishwa (Active Employees)</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-250">Elibariki Nelson</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Kitengo: IT Infrastructure Manager • elibariki@acme.com</p>
                        </div>
                        <span className="bg-brand-50 text-brand-600 border border-brand-200 text-[8px] font-bold px-2 py-0.5 rounded-full">MANAGER</span>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-250">Mariam Shaban</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Kitengo: Maintenance Officer • mariam@acme.com</p>
                        </div>
                        <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[8px] font-bold px-2 py-0.5 rounded-full">EMPLOYEE</span>
                      </div>
                    </div>
                  </div>

                  {/* Billing / Invoice section */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Ripoti ya Ankara & Ankara (Invoicing)</h3>
                    <div className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Kikomo cha Matumizi (Monthly Limit)</p>
                        <p className="text-lg font-black text-brand-650 dark:text-brand-400">TZS 1,500,000</p>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2 space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-550">
                          <span>Jumla Iliyotumika:</span>
                          <span>TZS 320,000</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-550">
                          <span>Baki iliyobaki:</span>
                          <span>TZS 1,180,000</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          showNotification('Ankara inapakuliwa... (Downloading Invoice PDF)');
                        }}
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all"
                      >
                        <FileDown className="w-4 h-4" />
                        <span>Pakua Invoices (Invoice PDF)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* B. FUNDI DASHBOARD VIEWS */}
            {currentUser.role === 'fundi' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Tabs selection sidebar */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-2 text-xs font-semibold">
                  <button 
                    onClick={() => setFundiDashboardTab('profile')}
                    className={`w-full text-left p-3 rounded-xl flex items-center space-x-2.5 transition-all ${
                      fundiDashboardTab === 'profile' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Shield className="w-4.5 h-4.5" />
                    <span>Uhakiki na Nyaraka (Verification)</span>
                  </button>
                  <button 
                    onClick={() => setFundiDashboardTab('bookings')}
                    className={`w-full text-left p-3 rounded-xl flex items-center space-x-2.5 transition-all ${
                      fundiDashboardTab === 'bookings' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Briefcase className="w-4.5 h-4.5" />
                    <span>Miadi Zilizopo (Bookings)</span>
                  </button>
                  <button 
                    onClick={() => setFundiDashboardTab('portfolio')}
                    className={`w-full text-left p-3 rounded-xl flex items-center space-x-2.5 transition-all ${
                      fundiDashboardTab === 'portfolio' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Award className="w-4.5 h-4.5" />
                    <span>Portfolio Yangu ya Kazi</span>
                  </button>
                  <button 
                    onClick={() => setFundiDashboardTab('quotes')}
                    className={`w-full text-left p-3 rounded-xl flex items-center space-x-2.5 transition-all ${
                      fundiDashboardTab === 'quotes' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Sliders className="w-4.5 h-4.5" />
                    <span>Bao la Maombi (Quote Board)</span>
                  </button>
                  <button 
                    onClick={() => setFundiDashboardTab('chats')}
                    className={`w-full text-left p-3 rounded-xl flex items-center space-x-2.5 transition-all ${
                      fundiDashboardTab === 'chats' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                    <span>Mazungumzo na Wateja</span>
                  </button>
                </div>

                {/* Tab content right side */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {fundiDashboardTab === 'profile' && (
                    <div className="space-y-6">
                      
                      {/* Premium Trust & Progression Level Card */}
                      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg text-white space-y-6 animate-fadeIn">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-brand-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">GOLD LEVEL (GOLD PORTFOLIO)</span>
                              <span className="text-slate-400 font-extrabold text-xs">Points: 450 / 600</span>
                            </div>
                            <h2 className="text-xl font-black mt-2">Mwalimu wa Mafundi Trust & Quality Hub</h2>
                            <p className="text-xs text-slate-400 font-semibold mt-1">Uhakiki wako: 9/9 Trust Badges Imekamilika</p>
                          </div>

                          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3 text-right">
                            <div>
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Trust Score</p>
                              <p className="text-2xl font-black text-emerald-450">98 / 100</p>
                            </div>
                            <div className="w-2 h-10 bg-emerald-500 rounded-full"></div>
                          </div>
                        </div>

                        {/* Progression bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-extrabold text-slate-400 uppercase">
                            <span>Bronze</span>
                            <span>Silver</span>
                            <span className="text-brand-400">Gold</span>
                            <span>Platinum</span>
                            <span>Diamond</span>
                            <span>Elite</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-brand-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>

                        {/* Badges list */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Mabaji Yako (Awarded Trust Badges)</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-slate-900/80 border border-slate-800 text-[10.5px] font-bold text-slate-350 px-3 py-1.5 rounded-xl flex items-center space-x-1.5"><ShieldCheck className="w-4 h-4 text-brand-400" /> <span>Identity Verified</span></span>
                            <span className="bg-slate-900/80 border border-slate-800 text-[10.5px] font-bold text-slate-350 px-3 py-1.5 rounded-xl flex items-center space-x-1.5"><Award className="w-4 h-4 text-amber-500" /> <span>VETA Certified</span></span>
                            <span className="bg-slate-900/80 border border-slate-800 text-[10.5px] font-bold text-slate-350 px-3 py-1.5 rounded-xl flex items-center space-x-1.5"><Zap className="w-4 h-4 text-emerald-400" /> <span>Emergency Available</span></span>
                            <span className="bg-slate-900/80 border border-slate-800 text-[10.5px] font-bold text-slate-350 px-3 py-1.5 rounded-xl flex items-center space-x-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> <span>Top Rated</span></span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Wizard Step Tracker */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <button 
                            onClick={() => setWizardStep(1)}
                            className={`pb-2 border-b-2 px-2 transition-all ${wizardStep === 1 ? 'border-brand-500 text-brand-500' : 'border-transparent hover:text-slate-600'}`}
                          >
                            1. Specialties & Prices
                          </button>
                          <button 
                            onClick={() => setWizardStep(2)}
                            className={`pb-2 border-b-2 px-2 transition-all ${wizardStep === 2 ? 'border-brand-500 text-brand-500' : 'border-transparent hover:text-slate-600'}`}
                          >
                            2. Schedule & Vacation
                          </button>
                          <button 
                            onClick={() => setWizardStep(3)}
                            className={`pb-2 border-b-2 px-2 transition-all ${wizardStep === 3 ? 'border-brand-500 text-brand-500' : 'border-transparent hover:text-slate-600'}`}
                          >
                            3. Service Area
                          </button>
                          <button 
                            onClick={() => setWizardStep(4)}
                            className={`pb-2 border-b-2 px-2 transition-all ${wizardStep === 4 ? 'border-brand-500 text-brand-500' : 'border-transparent hover:text-slate-600'}`}
                          >
                            4. Verification Docs
                          </button>
                          <button 
                            onClick={() => setWizardStep(5)}
                            className={`pb-2 border-b-2 px-2 transition-all ${wizardStep === 5 ? 'border-brand-500 text-brand-500' : 'border-transparent hover:text-slate-600'}`}
                          >
                            5. Profile Bio & Langs
                          </button>
                        </div>
                      </div>

                      {/* STEP 1: Specialties and custom pricing structures */}
                      {wizardStep === 1 && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
                          <h3 className="font-extrabold text-sm text-slate-405 uppercase tracking-wider block">Specialties & Pricing Rules</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">Sanidi kazi yako kuu, kazi za ziada, viwango vyako vya uzoefu, na gharama zako tofauti za malipo.</p>
                          
                          <div className="space-y-4 text-xs font-semibold">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-slate-400">Kazi Kuu (Primary Profession)</label>
                                <select 
                                  value={currentUser.profession}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-100"
                                  disabled
                                >
                                  <option>{currentUser.profession}</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-400">Skill Level (Primary specialty)</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-100">
                                  <option value="Professional">Professional (Uzoefu wa Kati)</option>
                                  <option value="Expert">Expert (Mtaalamu aliyebobea)</option>
                                  <option value="Master">Master (Fundi Mkuu / Bingwa)</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-slate-400">Bei ya Kuanzia (Starting Price / Optional)</label>
                                <input 
                                  type="number" 
                                  value={wizardStartingPrice} 
                                  onChange={(e) => setWizardStartingPrice(parseInt(e.target.value))}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl" 
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-400">Ada ya Ukaguzi (Inspection Fee / Optional)</label>
                                <input 
                                  type="number" 
                                  value={wizardInspectionFee} 
                                  onChange={(e) => setWizardInspectionFee(parseInt(e.target.value))}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl" 
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 flex justify-end">
                            <button 
                              onClick={() => setWizardStep(2)}
                              className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md transition-all text-xs"
                            >
                              Endelea (Next) &rarr;
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: Weekly Availabilities & lunch breaks & vacation modes */}
                      {wizardStep === 2 && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
                          <h3 className="font-extrabold text-sm text-slate-405 uppercase tracking-wider block">Weekly Availability Schedule</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">Dhibiti ratiba yako ya kazi kila wiki na pumziko la chakula cha mchana ili kuzuia miadi kugongana.</p>
                          
                          <div className="space-y-4 text-xs font-semibold">
                            <div className="space-y-2">
                              <label className="text-slate-400 block font-bold">Siku za Kazi (Working Days):</label>
                              <div className="flex flex-wrap gap-2">
                                {['Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi', 'Jumapili'].map((day, idx) => (
                                  <label key={idx} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-850 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={wizardWorkingDays.includes(idx + 1)}
                                      onChange={() => {
                                        if (wizardWorkingDays.includes(idx + 1)) {
                                          setWizardWorkingDays(wizardWorkingDays.filter(d => d !== idx + 1));
                                        } else {
                                          setWizardWorkingDays([...wizardWorkingDays, idx + 1]);
                                        }
                                      }}
                                      className="accent-brand-500" 
                                    />
                                    <span>{day}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-slate-400">Muda wa Kuanza Kazi (Start Time)</label>
                                <input type="time" value={wizardWorkingHoursStart} onChange={(e) => setWizardWorkingHoursStart(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-100" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-400">Muda wa Kumaliza Kazi (End Time)</label>
                                <input type="time" value={wizardWorkingHoursEnd} onChange={(e) => setWizardWorkingHoursEnd(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-100" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-slate-400">Kuanza Chakula cha Mchana (Lunch Break Start)</label>
                                <input type="time" value={wizardLunchStart} onChange={(e) => setWizardLunchStart(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-100" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-400">Kumaliza Chakula cha Mchana (Lunch Break End)</label>
                                <input type="time" value={wizardLunchEnd} onChange={(e) => setWizardLunchEnd(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-100" />
                              </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                              <label className="flex items-center space-x-2.5 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={wizardVacation} 
                                  onChange={() => setWizardVacation(!wizardVacation)}
                                  className="accent-brand-500 w-4 h-4" 
                                />
                                <span className="font-extrabold text-slate-800 dark:text-slate-150">Wezesha Hali ya Likizo (Vacation Mode)</span>
                              </label>

                              {wizardVacation && (
                                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                                  <div className="space-y-1">
                                    <label className="text-slate-400">Likizo Kuanzia (Start Date)</label>
                                    <input type="date" value={wizardVacationStart} onChange={(e) => setWizardVacationStart(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-100" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-slate-400">Likizo Kuisha (End Date)</label>
                                    <input type="date" value={wizardVacationEnd} onChange={(e) => setWizardVacationEnd(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-100" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-4 flex justify-between">
                            <button onClick={() => setWizardStep(1)} className="text-slate-500 hover:text-slate-700 font-extrabold">&larr; Nyuma</button>
                            <button onClick={() => setWizardStep(3)} className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md">Endelea &rarr;</button>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: Service Area Radius & Emergency toggle */}
                      {wizardStep === 3 && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
                          <h3 className="font-extrabold text-sm text-slate-405 uppercase tracking-wider block">Service Area & Location</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">Bainisha umbali wa mradi unaoweza kusafiri (radius) na kama unatoa huduma ya dharura ya saa 24.</p>
                          
                          <div className="space-y-4 text-xs font-semibold">
                            <div className="space-y-2">
                              <div className="flex justify-between font-bold">
                                <label className="text-slate-350">Urefu wa Eneo la Huduma (Kinondoni + working radius):</label>
                                <span className="text-brand-500 font-black">{wizardRadius} km</span>
                              </div>
                              <input 
                                type="range" 
                                min="5" 
                                max="50" 
                                value={wizardRadius}
                                onChange={(e) => setWizardRadius(parseInt(e.target.value))}
                                className="w-full accent-brand-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                              />
                              <p className="text-[10px] text-slate-400">Hii inaamua upatikanaji wako kwa wateja wanaotafuta mafundi wa karibu.</p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                              <label className="flex items-center space-x-2.5 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={wizardEmergency} 
                                  onChange={() => setWizardEmergency(!wizardEmergency)}
                                  className="accent-brand-500 w-4 h-4" 
                                />
                                <span className="font-extrabold text-slate-800 dark:text-slate-150">Natoa huduma ya Dharura 24/7 (Emergency Service Enabled)</span>
                              </label>
                              <p className="text-[10px] text-slate-455 ml-6.5 leading-relaxed font-semibold">
                                Wateja wataona beji maalum ya "Emergency" kwenye wasifu wako na wanaweza kuomba miadi ya dharura nje ya masaa yako ya kawaida ya kazi kwa bei ya juu zaidi.
                              </p>
                            </div>
                          </div>

                          <div className="pt-4 flex justify-between">
                            <button onClick={() => setWizardStep(2)} className="text-slate-500 hover:text-slate-700 font-extrabold">&larr; Nyuma</button>
                            <button onClick={() => setWizardStep(4)} className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md">Endelea &rarr;</button>
                          </div>
                        </div>
                      )}

                      {/* STEP 4: Verification docs inputs */}
                      {wizardStep === 4 && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
                          <h3 className="font-extrabold text-sm text-slate-405 uppercase tracking-wider block">Uhakiki na Hati za Kitaalamu (Verification Details)</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">Wasilisha vitambulisho na vyeti vyako ili vihakikiwe na wasimamizi wetu.</p>
                          
                          <form onSubmit={handleDocsSubmit} className="space-y-4 text-xs font-semibold">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-slate-400">Nambari ya NIDA (National ID)</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={nidaInput}
                                  onChange={(e) => setNidaInput(e.target.value)}
                                  placeholder="e.g. 19900812-11105-XXXXX-XX"
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-400">Nakala ya NIDA (Kadi Picha)</label>
                                <input 
                                  type="file" 
                                  required 
                                  onChange={(e) => setSelectedNidaFile(e.target.value)}
                                  className="w-full text-slate-455 pt-2"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-slate-400">Leseni ya Ufundi (k.m. EWURA License)</label>
                                <input 
                                  type="file" 
                                  required 
                                  onChange={(e) => setSelectedLicenseFile(e.target.value)}
                                  className="w-full text-slate-455 pt-2"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-400">Cheti cha Chuo / VETA Certificate</label>
                                <input 
                                  type="file" 
                                  required 
                                  onChange={(e) => setSelectedCertFile(e.target.value)}
                                  className="w-full text-slate-455 pt-2"
                                />
                              </div>
                            </div>

                            {/* Camera Webcam Simulator */}
                            <div className="border border-dashed border-slate-205 dark:border-slate-700 rounded-2xl p-6 bg-slate-50 dark:bg-slate-850/30 text-center space-y-3.5">
                              <Camera className="w-8 h-8 mx-auto text-slate-400 animate-pulse" />
                              <div>
                                <span className="font-extrabold text-xs block">Simulated Real-time Face Verification Camera</span>
                                <p className="text-[10px] text-slate-455 max-w-sm mx-auto leading-relaxed mt-0.5">Tafadhali kagua kuwa kamera yako inafanya kazi ili kuchukua picha ya sura yako kwa ajili ya kufananisha na picha ya NIDA.</p>
                              </div>
                              
                              {webcamSimulated ? (
                                <div className="bg-emerald-500/10 text-emerald-500 font-extrabold text-xs py-2.5 px-4 rounded-xl border border-emerald-500/25 w-fit mx-auto">
                                  Face Scanned successfully! Matching 99.4% with NIDA card photo.
                                </div>
                              ) : (
                                <button 
                                  type="button" 
                                  onClick={() => setWebcamSimulated(true)}
                                  className="bg-brand-500 hover:bg-brand-605 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all inline-block"
                                >
                                  Washa Kamera & Scan Sura (Face Verify)
                                </button>
                              )}
                            </div>

                            <div className="pt-4 flex justify-between">
                              <button type="button" onClick={() => setWizardStep(3)} className="text-slate-500 hover:text-slate-700 font-extrabold">&larr; Nyuma</button>
                              <button type="button" onClick={() => setWizardStep(5)} className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md">Endelea &rarr;</button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* STEP 5: Languages and bio, submit all */}
                      {wizardStep === 5 && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
                          <h3 className="font-extrabold text-sm text-slate-405 uppercase tracking-wider block">Bio, Lugha & Hifadhi (Finish Setup)</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">Kamilisha wasifu wako kwa kuandika maelezo mafupi kuhusu ujuzi wako na lugha unazoongea.</p>
                          
                          <div className="space-y-4 text-xs font-semibold">
                            <div className="space-y-1">
                              <label className="text-slate-400">Wasifu Wako wa Kitaalamu (Professional Bio)</label>
                              <textarea 
                                rows={4}
                                value={wizardBio}
                                onChange={(e) => setWizardBio(e.target.value)}
                                placeholder="Andika maelezo yatakayoonekana kwa wateja (k.m. Uzoefu wako, maeneo uliyobobea, falsafa yako ya huduma)..."
                                className="w-full bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-700 outline-none px-4 py-2.5 rounded-xl resize-none text-slate-800 dark:text-slate-100"
                              ></textarea>
                            </div>

                            <div className="space-y-2">
                              <label className="text-slate-400 block font-bold font-bold">Lugha unazoongea (Languages Spoken):</label>
                              <div className="flex space-x-4">
                                {['Swahili', 'English', 'Kiarabu'].map((lang) => (
                                  <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                                    <input 
                                      type="checkbox"
                                      checked={wizardLanguages.includes(lang)}
                                      onChange={() => {
                                        if (wizardLanguages.includes(lang)) {
                                          setWizardLanguages(wizardLanguages.filter(l => l !== lang));
                                        } else {
                                          setWizardLanguages([...wizardLanguages, lang]);
                                        }
                                      }}
                                      className="accent-brand-500 w-4 h-4" 
                                    />
                                    <span>{lang}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 flex justify-between border-t border-slate-100 dark:border-slate-800">
                            <button onClick={() => setWizardStep(4)} className="text-slate-500 hover:text-slate-700 font-extrabold">&larr; Nyuma</button>
                            <button 
                              onClick={async () => {
                                try {
                                  await fetch('/api/fundis/profile', {
                                    method: 'PUT',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    },
                                    body: JSON.stringify({
                                      bio: wizardBio,
                                      experienceYears: 5,
                                      startingPrice: wizardStartingPrice,
                                      inspectionFee: wizardInspectionFee,
                                      languagesSpoken: wizardLanguages,
                                      serviceAreaType: 'RADIUS',
                                      serviceAreaRadius: wizardRadius,
                                      emergencyServiceEnabled: wizardEmergency,
                                      vacationMode: wizardVacation,
                                      vacationStart: wizardVacationStart || null,
                                      vacationEnd: wizardVacationEnd || null,
                                      workingDays: wizardWorkingDays,
                                      workingHoursStart: wizardWorkingHoursStart,
                                      workingHoursEnd: wizardWorkingHoursEnd,
                                      lunchBreakStart: wizardLunchStart,
                                      lunchBreakEnd: wizardLunchEnd
                                    })
                                  });
                                  alert('Hongera! Wasifu wako upgraded umesasishwa kikamilifu!');
                                } catch {
                                  alert('Wasifu upgraded umesasishwa kikamilifu! (Mock state updated)');
                                }
                              }}
                              className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md transition-all"
                            >
                              Hifadhi na Tuma (Submit Profile) &nbsp;✓
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* TAB 2: Bookings manager */}
                  {fundiDashboardTab === 'bookings' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Bookings za Kazi Zangu</h3>
                      
                      <div className="space-y-4 text-xs font-semibold">
                        {bookings.filter(b => b.fundi.id === currentUser.id).length === 0 ? (
                          <p className="text-xs text-slate-455">Hakuna booking yoyote iliyosajiliwa kwako kwa sasa.</p>
                        ) : (
                          bookings.filter(b => b.fundi.id === currentUser.id).map(b => (
                            <div key={b.id} className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-extrabold text-sm">{b.customer}</span>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                                    b.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-550/20' : 'bg-brand-50 text-brand-550 border-brand-500/20'
                                  }`}>{b.status}</span>
                                </div>
                                <p className="text-slate-500 leading-relaxed font-semibold">{b.description}</p>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  Gharama: <span className="font-bold text-brand-500">TZS {b.price.toLocaleString()}</span> • Anwani: {b.address}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Portfolio gallery manager */}
                  {fundiDashboardTab === 'portfolio' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Left: Add portfolio item form */}
                      <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                        <h4 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Ongeza Kazi Mpya</h4>
                        <form onSubmit={handlePortfolioUpload} className="space-y-4 text-xs font-semibold">
                          <div className="space-y-1">
                            <label className="text-slate-400">Kichwa cha Mradi (Project Title)</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. Ukarabati wa mabomba ya jikoni"
                              value={newPortfolioItem.title}
                              onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, title: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-400">Maelezo ya Kazi (Description)</label>
                            <textarea 
                              required 
                              rows={3} 
                              placeholder="Andika kwa ufupi jinsi ulivyofanya kazi hiyo..."
                              value={newPortfolioItem.description}
                              onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, description: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl resize-none"
                            ></textarea>
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-400">Project Location (Street/District)</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Kinondoni, Dar es Salaam"
                              value={newPortfolioItem.location}
                              onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, location: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-slate-400">Before Image URL</label>
                              <input 
                                type="text" 
                                value={newPortfolioItem.beforeImage}
                                onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, beforeImage: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-slate-400">After Image URL</label>
                              <input 
                                type="text" 
                                value={newPortfolioItem.afterImage}
                                onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, afterImage: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-400">Mock Video URL (Optional)</label>
                            <input 
                              type="text" 
                              placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                              value={newPortfolioItem.videoUrl}
                              onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, videoUrl: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl"
                            />
                          </div>

                          <button 
                            type="submit" 
                            className="w-full bg-brand-500 hover:bg-brand-655 text-white font-extrabold py-3.5 rounded-xl shadow-md transition-all text-xs"
                          >
                            Pakia Portfolio Item
                          </button>
                        </form>
                      </div>

                      {/* Right: Portfolio items view */}
                      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                        <h4 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Portfolio Yangu ya Kazi</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {portfolios.filter(p => p.fundiId === currentUser.id).map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => {
                                setSelectedProject(p);
                              }}
                              className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:shadow hover:scale-103 transition-all bg-slate-50 dark:bg-slate-850"
                            >
                              <img src={p.afterImage} alt={p.title} className="w-full h-32 object-cover" />
                              <div className="p-3.5 space-y-1 text-xs">
                                <h5 className="font-extrabold text-slate-800 truncate dark:text-slate-150">{p.title}</h5>
                                <p className="text-[10px] text-slate-400 font-medium truncate">{p.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 4: Quote Board - submit quotes/bids */}
                  {fundiDashboardTab === 'quotes' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
                      <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Bao la Maombi ya Nukuu za Bei (Active Quote Requests)</h3>
                      
                      <div className="space-y-6">
                        {quoteRequests.filter(q => q.professionId === (currentUser.profession === 'Plumber' ? '2' : currentUser.profession === 'Electrician' ? '1' : '3') && q.isActive).length === 0 ? (
                          <p className="text-xs text-slate-455">Hakuna maombi ya bei yanayolingana na taaluma yako kwa sasa.</p>
                        ) : (
                          quoteRequests
                            .filter(q => q.professionId === (currentUser.profession === 'Plumber' ? '2' : currentUser.profession === 'Electrician' ? '1' : '3') && q.isActive)
                            .map(req => {
                              const alreadyBid = req.bids.some((b: any) => b.fundiId === currentUser.id);

                              return (
                                <div key={req.id} className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-150">{req.title}</h4>
                                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">{req.description}</p>
                                      <div className="text-[10px] text-slate-400 font-medium">
                                        Mteja: {req.customerName} • Eneo: {req.location} • Bajeti ya Juu: TZS {req.budgetMax.toLocaleString()}
                                      </div>
                                    </div>
                                    <span className="text-[9px] font-black bg-brand-50 text-brand-550 border border-brand-500/20 px-2.5 py-1 rounded-lg uppercase">
                                      {alreadyBid ? 'NUKUU IMEWASILISHWA' : 'BEI INAHITAJIKA'}
                                    </span>
                                  </div>

                                  {!alreadyBid ? (
                                    <div className="pt-2 flex justify-end">
                                      <button 
                                        onClick={() => {
                                          setActiveRequestForBid(req);
                                        }}
                                        className="bg-brand-500 hover:bg-brand-655 text-white font-extrabold text-[10px] px-5 py-2.5 rounded-lg shadow-md transition-all uppercase"
                                      >
                                        Wasilisha Nukuu (Submit Quotation)
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-500/25 p-3 rounded-xl text-[10px] font-bold">
                                      Tayari umewasilisha nukuu ya bei ya TZS {req.bids.find((b: any) => b.fundiId === currentUser.id)?.quotationAmount.toLocaleString()} kwa ajili ya mradi huu.
                                    </div>
                                  )}
                                </div>
                              );
                            })
                        )}
                      </div>

                      {/* Submit Bid Form Modal */}
                      {activeRequestForBid && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative animate-zoomIn max-h-[90vh] overflow-y-auto">
                            <button 
                              onClick={() => setActiveRequestForBid(null)} 
                              className="absolute top-4 right-4 text-slate-455 hover:text-slate-655 dark:hover:text-slate-200 text-lg"
                            >
                              <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-1">
                              <h2 className="text-xl font-black">Wasilisha Nukuu ya Kazi (Submit Bid)</h2>
                              <p className="text-xs text-slate-400">Jaza fomu hii kwa umakini ili kumpa mteja maelezo bora ya nukuu yako.</p>
                            </div>

                            <form onSubmit={handleBidSubmit} className="space-y-4 text-xs font-semibold">
                              <div className="space-y-1">
                                <label className="text-slate-400">Gharama Kamili ya Kazi (TZS)</label>
                                <input 
                                  type="number" 
                                  required 
                                  placeholder="e.g. 100000"
                                  value={bidForm.amount}
                                  onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl font-bold"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-slate-400">Muda uliokadiriwa kukamilisha</label>
                                  <select 
                                    value={bidForm.hours}
                                    onChange={(e) => setBidForm({ ...bidForm, hours: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl"
                                  >
                                    <option value="2 hours">2 masaa</option>
                                    <option value="4 hours">4 masaa</option>
                                    <option value="1 day">1 Siku</option>
                                    <option value="3 days">3 Siku</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-slate-400">Muda wa Udhamini (Warranty)</label>
                                  <select 
                                    value={bidForm.warranty}
                                    onChange={(e) => setBidForm({ ...bidForm, warranty: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl"
                                  >
                                    <option value="No Warranty">Haikujumuishwa (No Warranty)</option>
                                    <option value="7 Days">Siku 7 (7 Days)</option>
                                    <option value="14 Days">Siku 14 (14 Days)</option>
                                    <option value="30 Days">Siku 30 (30 Days)</option>
                                    <option value="60 Days">Siku 60 (60 Days)</option>
                                    <option value="90 Days">Siku 90 (90 Days)</option>
                                    <option value="6 Months">Miezi 6 (6 Months)</option>
                                    <option value="1 Year">Mwaka 1 (1 Year)</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-slate-400">Je, Vifaa Vimejumuishwa kwenye bei hii?</label>
                                <div className="flex space-x-4 pt-1 font-bold">
                                  <label className="flex items-center space-x-1.5 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={bidForm.materials}
                                      onChange={(e) => setBidForm({ ...bidForm, materials: e.target.checked })}
                                      className="rounded border-slate-350 text-brand-500 focus:ring-brand-500" 
                                    />
                                    <span>Ndio, vifaa vyote vimejumuishwa (Materials Included)</span>
                                  </label>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <label className="text-slate-400">Muda wa Kuwasili (Arrival Time)</label>
                                <select 
                                  value={bidForm.arrivalTime}
                                  onChange={(e) => setBidForm({ ...bidForm, arrivalTime: e.target.value })}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl"
                                >
                                  <option value="30 mins">Muda mfupi (Dakika 30)</option>
                                  <option value="1 hour">Saa 1</option>
                                  <option value="2 hours">Masaa 2</option>
                                  <option value="Tomorrow">Kesho asubuhi</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-slate-400">Ziada na Masharti (Notes to client)</label>
                                <textarea 
                                  rows={3} 
                                  placeholder="Andika ujumbe wowote wa ziada kwa mteja k.m. 'Nitakuja na wasaidizi wawili'..."
                                  value={bidForm.notes}
                                  onChange={(e) => setBidForm({ ...bidForm, notes: e.target.value })}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl resize-none"
                                ></textarea>
                              </div>

                              <button 
                                type="submit" 
                                className="w-full bg-brand-500 hover:bg-brand-655 text-white font-extrabold py-3.5 rounded-xl shadow-md transition-all text-xs"
                              >
                                Wasilisha Quotation ya Bei
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: Fundi Chats */}
                  {fundiDashboardTab === 'chats' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-sm text-slate-455 uppercase tracking-wider">Mazungumzo yangu na Wateja</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ height: '400px' }}>
                        {/* Inbox threads */}
                        <div className="md:col-span-1 space-y-2 border-r border-slate-100 dark:border-slate-800 pr-4 overflow-y-auto">
                          {chats.map(c => (
                            <div 
                              key={c.id} 
                              onClick={() => setActiveChatId(c.id)}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                activeChatId === c.id 
                                  ? 'border-brand-500 bg-brand-50/10 dark:bg-brand-950/20' 
                                  : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs text-slate-700">
                                  {c.partnerName.charAt(0)}
                                </div>
                                <div className="text-xs">
                                  <span className="font-bold block">{c.partnerName}</span>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[100px] font-medium">{c.lastMessage}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Message Box */}
                        <div className="md:col-span-2 flex flex-col justify-between h-full">
                          {activeChatId ? (
                            <div className="flex flex-col justify-between h-full">
                              <div className="bg-slate-50 dark:bg-slate-850 p-3 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs font-bold">
                                <span>{chats.find(c => c.id === activeChatId)?.partnerName}</span>
                                {isTypingSimulated && <span className="text-[8px] text-slate-455 font-bold animate-pulse">Anaandika...</span>}
                              </div>

                              <div className="flex-grow p-3 overflow-y-auto space-y-2 text-[11px] font-semibold bg-slate-50/20">
                                {chats.find(c => c.id === activeChatId)?.messages.map((m: any) => (
                                  <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-2.5 rounded-2xl max-w-[85%] ${
                                      m.senderId === currentUser.id 
                                        ? 'bg-brand-500 text-white rounded-tr-none' 
                                        : 'bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-250 rounded-tl-none'
                                    }`}>
                                      {m.text}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="p-2 border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-1">
                                <input 
                                  type="text" 
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                  placeholder="Andika ujumbe hapa..."
                                  className="flex-grow bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-[11px] px-3 py-2 rounded-xl"
                                />
                                <button 
                                  onClick={handleSendMessage}
                                  className="bg-brand-500 text-white p-2 rounded-xl"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center p-12 text-slate-400 text-xs font-semibold">
                              Uteuzi wa Mazungumzo uweze kuanza kuwasiliana.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* C. ADMIN VIEWS */}
            {(currentUser.role === 'verification_officer' || currentUser.role === 'super_admin') && (
              <div className="space-y-6">
                
                {/* Verification Center */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Kituo cha Uhakiki wa Mafundi (Verification Center)</h3>
                  
                  <div className="space-y-4">
                    {fundis.filter(f => f.verificationStatus === 'pending_verification').length === 0 ? (
                      <p className="text-xs text-slate-400">Hakuna mafundi wanaosubiri uhakiki kwa sasa.</p>
                    ) : (
                      fundis.filter(f => f.verificationStatus === 'pending_verification').map(f => (
                        <div key={f.id} className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 text-xs font-semibold">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-sm block">{f.fullName}</span>
                              <span className="text-slate-400">Taaluma: {f.profession} | NIDA: {f.nationalId}</span>
                            </div>
                            <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded">PENDING MANUAL APPROVAL</span>
                          </div>

                          <div className="border border-slate-150 dark:border-slate-800 p-4 rounded-xl space-y-2 bg-white dark:bg-slate-900 font-bold">
                            <span className="text-[10px] text-slate-400 block uppercase">Nyaraka Zilizowasilishwa</span>
                            <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-350">
                              <div>• Kadi ya NIDA: <span className="text-brand-500 font-extrabold cursor-pointer hover:underline">nida_card_copy.jpg (View File)</span></div>
                              <div>• Leseni ya Kazi / Cheti VETA: <span className="text-brand-500 font-extrabold cursor-pointer hover:underline">veta_electrician_cert.pdf (View File)</span></div>
                              <div>• Uhakiki wa Sura (Face Match): <span className="text-emerald-500 font-extrabold">Scanned & Matched (99.4%)</span></div>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => {
                                setFundis(prev => prev.map(item => item.id === f.id ? { ...item, verificationStatus: 'rejected' } : item));
                                showNotification('Ombi la uhakiki limekataliwa.');
                              }}
                              className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-extrabold text-[10px] px-4 py-2 rounded-xl transition-all"
                            >
                              Kataa (Reject)
                            </button>
                            <button 
                              onClick={() => handleApproveFundi(f.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl shadow transition-all"
                            >
                              Thibitisha na Weka Active (Approve & Verify)
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* BEFORE & AFTER DETAILED PROJECT MODAL OVERLAY */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative animate-zoomIn max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setSelectedProject(null);
                setSliderPosition(50);
              }} 
              className="absolute top-4 right-4 text-slate-455 hover:text-slate-655 dark:hover:text-slate-200 text-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-405 border border-brand-500/20 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold w-fit block">{selectedProject.serviceCategory}</span>
              <h2 className="text-xl font-black">{selectedProject.title}</h2>
              <p className="text-[11px] text-slate-400 font-bold">Kazi ilikamilishwa tarehe: {selectedProject.completionDate} • Eneo: {selectedProject.location}</p>
            </div>

            {/* Before & After Interactive Slider */}
            <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg select-none border border-slate-100 dark:border-slate-800">
              {/* After image */}
              <img 
                src={selectedProject.afterImage} 
                alt="After" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
              />
              
              {/* Before image container with clipPath */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img 
                  src={selectedProject.beforeImage} 
                  alt="Before" 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Slider Drag Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-8 h-8 bg-white text-slate-900 border border-slate-200 rounded-full flex items-center justify-center text-xs font-black shadow-2xl relative -translate-x-1/2 select-none select-none pointer-events-none">
                  &harr;
                </div>
              </div>

              {/* Input range overlay to capture sliding */}
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPosition}
                onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />

              {/* Badges labels */}
              <div className="absolute bottom-3 left-3 z-10 bg-slate-900/70 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg">BEFORE</div>
              <div className="absolute bottom-3 right-3 z-10 bg-brand-500/80 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg">AFTER</div>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed font-semibold">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 block mb-1">Maelezo ya Kazi:</span>
              {selectedProject.description}
            </div>

            {selectedProject.videoUrl && (
              <div className="space-y-1.5">
                <span className="font-extrabold text-xs text-slate-805 block">Video ya Kazi:</span>
                <video src={selectedProject.videoUrl} controls className="w-full rounded-2xl max-h-48 bg-black outline-none border border-slate-200 dark:border-slate-800"></video>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedFundi && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl relative animate-zoomIn max-h-[90vh] overflow-y-auto">
            
            {/* Cover Banner */}
            <div className="h-32 w-full bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 rounded-t-3xl relative">
              <button 
                onClick={() => {
                  setSelectedFundi(null);
                  setSliderPosition(50);
                }} 
                className="absolute top-4 right-4 bg-slate-900/40 hover:bg-slate-900/60 text-white p-2 rounded-full transition-all backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Header Block */}
            <div className="px-6 md:px-8 pb-4 relative -translate-y-10 text-xs font-semibold">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-end space-x-4">
                  <div className="w-24 h-24 bg-brand-500 text-white rounded-3xl flex items-center justify-center font-black text-3xl border-4 border-white dark:border-slate-900 shadow-lg">
                    {selectedFundi.fullName.charAt(0)}
                  </div>
                  <div className="pb-1">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{selectedFundi.fullName}</h2>
                      {selectedFundi.verifiedBadge && (
                        <span className="bg-brand-500 text-white p-1 rounded-full text-[10px]" title="Identity Verified">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    
                    <span className="text-brand-500 font-extrabold text-xs block mt-1">
                      💼 {language === 'sw' ? 'Kazi Kuu: ' : 'Primary Profession: '} 
                      {(() => {
                        const mainProf = selectedFundi.primaryProfession || selectedFundi.profession;
                        const matched = MOCK_PROFESSIONS.find(p => p.nameEn === mainProf);
                        return matched ? (language === 'sw' ? matched.nameSw : matched.nameEn) : mainProf;
                      })()}
                    </span>

                    {/* Secondary Specialties */}
                    {(() => {
                      const mainProf = selectedFundi.primaryProfession || selectedFundi.profession;
                      const list = selectedFundi.secondaryProfessions || 
                                   (selectedFundi.professions ? selectedFundi.professions.filter((x: string) => x !== mainProf) : []);
                      if (!list || list.length === 0) return null;
                      return (
                        <span className="text-slate-455 font-bold text-[10px] block mt-0.5">
                          🛠️ {language === 'sw' ? 'Ujuzi Mwingine: ' : 'Other Skills: '}
                          {list.map((prof: string) => {
                            const matched = MOCK_PROFESSIONS.find(p => p.nameEn === prof);
                            return matched ? (language === 'sw' ? matched.nameSw : matched.nameEn) : prof;
                          }).join(', ')}
                        </span>
                      );
                    })()}

                    <span className="text-slate-400 font-semibold text-[10px] block mt-1">📍 {selectedFundi.location || 'Dar es Salaam, Tanzania'}</span>
                  </div>
                </div>

                <div className="text-right pb-1">
                  <span className="text-2xl font-black text-brand-500 block">Bei ya Kuanzia: TZS {(selectedFundiDetails?.profile?.starting_price || selectedFundiDetails?.profile?.starting_price || selectedFundi.price).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Warranty Offered: {selectedFundi.serviceWarranty || '30 Days'}</span>
                </div>
              </div>
            </div>

            {/* Main Content Sections */}
            <div className="px-6 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs font-semibold -mt-4">
              
              {/* Left & Middle Column: Experience Timeline, Education, Portfolio */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Vacation Mode Banner */}
                {selectedFundiDetails?.profile?.vacation_mode && (
                  <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold leading-relaxed">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p>Mwanachama yuko Likizo (Currently on Vacation)</p>
                      <p className="text-[10px] text-slate-455 font-normal mt-0.5">Atarejea kazi tarehe {selectedFundiDetails.profile.vacation_end || 'hivi karibuni'}.</p>
                    </div>
                  </div>
                )}

                {/* About Me */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Kuhusu Mimi (About Me)</h4>
                  <p className="text-slate-500 leading-relaxed font-semibold">{selectedFundiDetails?.profile?.bio || selectedFundi.bio}</p>
                </div>

                {/* Badges Feed */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Beji na Vigezo vya Uaminifu (Trust Badges)</h4>
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                    {selectedFundiDetails?.profile?.identity_verified && (
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Identity Verified</span>
                      </span>
                    )}
                    {selectedFundiDetails?.profile?.veta_certified && (
                      <span className="bg-amber-500/10 text-amber-550 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>VETA Certified</span>
                      </span>
                    )}
                    {selectedFundiDetails?.profile?.background_checked && (
                      <span className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Background Checked</span>
                      </span>
                    )}
                    {selectedFundiDetails?.profile?.top_rated && (
                      <span className="bg-indigo-500/10 text-indigo-505 border border-indigo-500/20 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
                        <Star className="w-3.5 h-3.5" />
                        <span>Top Rated Fundi</span>
                      </span>
                    )}
                    {selectedFundiDetails?.profile?.premium_fundi && (
                      <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Premium Expert</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Professional Portfolio Slider */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Portfolio ya Kazi (Before & After Slider)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedFundiDetails?.portfolio || portfolios.filter(p => p.fundiId === selectedFundi.id)).map((p: any) => (
                      <div 
                        key={p.id} 
                        onClick={() => setSelectedProject(p)}
                        className="border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl hover:scale-102 transition-all cursor-pointer space-y-2 bg-slate-50/50 dark:bg-slate-850"
                      >
                        <img src={p.after_image_url || p.afterImage} alt={p.title} className="w-full h-28 object-cover rounded-xl" />
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="font-extrabold truncate dark:text-slate-150">{p.title}</span>
                          <span className="text-brand-500 text-[9px] font-black uppercase tracking-wider bg-brand-500/10 px-2 py-0.5 rounded">Slider &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Vyeti na Mafunzo (Certifications)</h4>
                  <div className="space-y-3">
                    {selectedFundiDetails?.certificates && selectedFundiDetails.certificates.length > 0 ? (
                      selectedFundiDetails.certificates.map((cert: any) => (
                        <div key={cert.id} className="p-4 bg-slate-50/60 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start space-x-3.5">
                          <div className="bg-brand-500/10 p-2.5 rounded-xl text-brand-500 flex-shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-slate-800 dark:text-slate-100 block">{cert.name}</span>
                              {cert.verification_status === 'verified' && (
                                <span className="bg-emerald-500/15 text-emerald-400 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-550/20">Verified</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{cert.institution} • Cert ID: {cert.certificate_number}</span>
                            <span className="text-[9px] text-slate-500 italic block mt-0.5">Issued: {cert.issue_date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-450 italic">Hakuna vyeti vilivyothibitishwa bado.</p>
                    )}
                  </div>
                </div>

                {/* Education Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Elimu (Education)</h4>
                  <div className="space-y-3">
                    {selectedFundiDetails?.education && selectedFundiDetails.education.length > 0 ? (
                      selectedFundiDetails.education.map((edu: any) => (
                        <div key={edu.id} className="p-4 bg-slate-50/60 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start space-x-3.5">
                          <div className="bg-cyan-500/10 p-2.5 rounded-xl text-cyan-500 flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-grow">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 block">{edu.course} ({edu.level})</span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{edu.institution}</span>
                            <span className="text-[9px] text-slate-500 italic block mt-0.5">Soma: {edu.start_date} – {edu.end_date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-450 italic">Hakuna taarifa za elimu zilizowasilishwa.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Availability, GPS area, Languages & Direct Actions */}
              <div className="md:col-span-1 space-y-6">
                
                {/* Call Panel */}
                <div className="border border-slate-150 dark:border-slate-850 p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 space-y-4">
                  <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-wider">Mawasiliano ya Dharura (Emergency Action)</h4>
                  
                  <div className="space-y-2.5 text-[11px] text-slate-655 dark:text-slate-350">
                    <div className="flex justify-between">
                      <span>Masaa ya Kazi:</span>
                      <span className="font-black text-slate-800 dark:text-slate-100">{selectedFundiDetails?.profile?.working_hours_start || selectedFundi.workingHoursStart} – {selectedFundiDetails?.profile?.working_hours_end || selectedFundi.workingHoursEnd}</span>
                    </div>
                    {selectedFundiDetails?.profile?.lunch_break_start && (
                      <div className="flex justify-between text-slate-400">
                        <span>Lunch Break:</span>
                        <span className="font-bold">{selectedFundiDetails.profile.lunch_break_start} – {selectedFundiDetails.profile.lunch_break_end}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Emergency Service:</span>
                      <span className={`font-black uppercase text-[9px] tracking-wider px-2 py-0.5 rounded ${selectedFundiDetails?.profile?.emergency_service_enabled ? 'bg-red-500/10 text-red-500' : 'bg-slate-200 text-slate-500'}`}>
                        {selectedFundiDetails?.profile?.emergency_service_enabled ? 'INAPATIKANA (24/7)' : 'Kawaida tu'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Muda wa Kujibu (Response Time):</span>
                      <span className="font-black text-brand-500">Ndani ya dakika {selectedFundi.responseTime || 45}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GPS Radius:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{selectedFundiDetails?.profile?.service_area_radius || selectedFundi.workingRadius || 15} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lugha (Languages):</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{selectedFundiDetails?.profile?.languages_spoken ? selectedFundiDetails.profile.languages_spoken.join(', ') : 'Swahili'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    <a 
                      href={`tel:${selectedFundi.phone_number || '+255755667788'}`}
                      className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Now (Piga Simu)</span>
                    </a>
                    <a 
                      href={`https://wa.me/${selectedFundi.phone_number?.replace('+', '') || '255755667788'}?text=Habari%20${selectedFundi.fullName.replace(' ', '%20')},%20nimeona%20wasifu%20wako%2520kwenye%20Fundi%2520Service.%20Naomba%20nukuu%20ya%20bei%20ya%20kazi.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Chat</span>
                    </a>
                    <button 
                      onClick={() => {
                        setSelectedFundi(null);
                        handleStartChatWithFundi(selectedFundi);
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Direct App Chat</span>
                    </button>
                  </div>
                </div>

                {/* Licenses List */}
                <div className="border border-slate-150 dark:border-slate-850 p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 space-y-3.5">
                  <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-wider">Leseni za Kazi (Professional Licenses)</h4>
                  {selectedFundiDetails?.licenses && selectedFundiDetails.licenses.length > 0 ? (
                    selectedFundiDetails.licenses.map((lic: any) => (
                      <div key={lic.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-slate-800 dark:text-slate-100 text-[11px]">{lic.license_number}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${lic.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{lic.status}</span>
                        </div>
                        <span className="text-[10px] text-slate-455 block">{lic.authority}</span>
                        <span className="text-[9px] text-slate-400 block font-medium">Expires: {lic.expiry_date}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic text-[11px]">Hakuna leseni zilizowasilishwa.</p>
                  )}
                </div>

              </div>

            </div>

            {/* Real Reviews view */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-6 md:p-8 space-y-4 font-semibold text-xs leading-relaxed">
              <h4 className="font-black text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">Maoni ya Kweli Kutoka kwa Wateja walioajiri (Real Reviews):</h4>
              <div className="space-y-4">
                {(selectedFundiDetails?.reviews || reviews.filter(r => r.fundiId === selectedFundi.id)).map((r: any) => (
                  <div key={r.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold">{r.customerName}</span>
                        <div className="flex items-center space-x-0.5 text-amber-500">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{r.completion_date || r.completionDate} • Cost: TZS {r.project_cost || r.projectCost ? (r.project_cost || r.projectCost).toLocaleString() : '0'}</span>
                    </div>

                    <p className="text-slate-505 dark:text-slate-400 font-semibold">{r.comment}</p>

                    {/* Review Before & After Comparison Grid */}
                    {r.beforePhotosUrls && r.beforePhotosUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 max-w-sm">
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 block font-bold">KAZI KABLA (BEFORE)</span>
                          <img src={r.beforePhotosUrls[0]} alt="Before" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 block font-bold">KAZI BAADA (AFTER)</span>
                          <img src={r.afterPhotosUrls[0]} alt="After" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      
      {/* SERVICE DETAILS MODAL OVERLAY */}
      {selectedService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative animate-zoomIn max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedService(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 text-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner & Title */}
            <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img 
                src={selectedService.banner} 
                alt={selectedService.nameEn}
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white space-y-1">
                <span className="text-[10px] font-black uppercase bg-brand-500 px-3 py-1 rounded-full">Marketplace Service</span>
                <h2 className="text-2xl md:text-3xl font-black">{language === 'sw' ? selectedService.nameSw : selectedService.nameEn}</h2>
              </div>
            </div>

            {/* 2-Column Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: Details, problems, required tools */}
              <div className="md:col-span-2 space-y-6 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                
                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Maelezo (Description)</h3>
                  <p>{language === 'sw' ? selectedService.descriptionSw : selectedService.description}</p>
                </div>

                {/* Common Problems Solved */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Matatizo Yanayotatuliwa (Problems Solved)</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {(language === 'sw' ? selectedService.commonProblemsSw : selectedService.commonProblems).map((prob: any, idx: number) => (
                      <li key={idx}>{prob}</li>
                    ))}
                  </ul>
                </div>

                {/* Completion Details */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">Kipindi cha Dhamana (Warranty Recommendation)</span>
                    <span className="text-slate-800 dark:text-slate-200 font-extrabold">{selectedService.warrantyRecommendation} Recommended</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">Muda wa Kukamilisha (Completion Time)</span>
                    <span className="text-slate-800 dark:text-slate-200 font-extrabold">{selectedService.avgCompletionTime}</span>
                  </div>
                </div>

                {/* Tools required */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Vifaa Vinavyotumika (Required Tools)</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.toolsRequired.map((tool: any, idx: number) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-350">{tool}</span>
                    ))}
                  </div>
                </div>

                {/* FAQs */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Maswali Yanayoulizwa Sana (FAQs)</h3>
                  {selectedService.faqs.map((faq: any, idx: number) => (
                    <div key={idx} className="space-y-1 bg-slate-50/50 dark:bg-slate-850/50 p-3.5 rounded-xl border border-slate-150/50 dark:border-slate-800/50">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200">{language === 'sw' ? faq.qSw : faq.q}</h4>
                      <p className="text-[11px] text-slate-400">{language === 'sw' ? faq.aSw : faq.a}</p>
                    </div>
                  ))}
                </div>

                {/* Reviews */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Mirejesho ya Wateja (Customer Reviews)</h3>
                  {selectedService.reviews.map((rev: any, idx: number) => (
                    <div key={idx} className="space-y-2 bg-slate-50/20 dark:bg-slate-850/20 p-4 rounded-xl border border-slate-150/20 dark:border-slate-800/20">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-800 dark:text-slate-200">{rev.name}</span>
                        <div className="flex items-center space-x-1 text-amber-500 font-extrabold text-[10px]">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-slate-400 font-medium">{rev.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Pricing Overview & Available Fundis list */}
              <div className="space-y-6">
                
                {/* Pricing Box */}
                <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-3xl border border-slate-150 dark:border-slate-800 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Kadirio la Gharama (Price Range)</span>
                    <span className="text-2xl font-black text-brand-500">{selectedService.priceRange}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-850">
                    <div className="flex justify-between">
                      <span>Ada ya Ukaguzi (Inspection Fee)</span>
                      <span className="text-slate-700 dark:text-slate-200 font-bold">TZS {selectedService.inspectionFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dhamana ya Kazi (Warranty)</span>
                      <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedService.warrantyRecommendation}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedService(null);
                      setActiveRequestForBid({
                        id: 'req-' + Math.floor(1000 + Math.random() * 9000),
                        title: language === 'sw' ? selectedService.nameSw : selectedService.nameEn,
                        description: 'Detailed Booking request from Marketplace details page.',
                        professionId: selectedService.id
                      });
                    }}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Omba Nukuu Sasa (Book Now)</span>
                  </button>
                </div>

                {/* Available Fundis list inside overlay */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Mafundi Waliopo (Available Fundis)</h3>
                  {fundis.filter(f => f.profession === selectedService.nameEn).length === 0 ? (
                    <p className="text-xs text-slate-400">Hakuna fundi wa karibu aliyepatikana kwa sasa.</p>
                  ) : (
                    fundis.filter(f => f.profession === selectedService.nameEn).map(f => (
                      <div key={f.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-950/20 text-brand-500 font-black text-sm flex items-center justify-center border border-brand-100 dark:border-brand-900">
                            {f.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs font-black text-slate-850 dark:text-slate-200">{f.fullName}</span>
                              {f.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">{f.profession}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                          <div className="flex items-center justify-between">
                            <span>Rating</span>
                            <span className="text-amber-500 font-extrabold flex items-center space-x-0.5">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{f.rating}</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Jobs</span>
                            <span className="text-slate-700 dark:text-slate-200 font-black">{f.jobsCompleted} jobs</span>
                          </div>
                          <div className="flex items-center justify-between col-span-2 pt-1 border-t border-slate-50 dark:border-slate-850">
                            <span>Mbali (Distance)</span>
                            <span className="text-brand-500 font-black">2.5 km (Mikocheni)</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1.5">
                          <button 
                            onClick={() => {
                              setSelectedService(null);
                              setSelectedFundi(f);
                            }}
                            className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-[9px] py-1.5 rounded-lg transition-colors"
                          >
                            View Profile
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedService(null);
                              // Trigger booking for this particular fundi
                              setBookings(prev => [
                                {
                                  id: 'B-' + Math.floor(1000 + Math.random() * 9000),
                                  fundi: f,
                                  customer: currentUser?.fullName || 'Amina Selemani',
                                  customerId: currentUser?.id || 'c_01',
                                  date: new Date().toISOString().split('T')[0],
                                  time: '11:00 AM',
                                  address: 'Mikocheni, Dar es Salaam',
                                  description: 'Direct Booking for ' + selectedService.nameEn,
                                  price: f.price,
                                  status: 'PRICE_CONFIRMED',
                                  paymentOption: 'online',
                                  dispute: false
                                },
                                ...prev
                              ]);
                              showNotification('Umekamilisha ombi la kazi kwa fundi huyu!');
                            }}
                            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-[9px] py-1.5 rounded-lg transition-colors"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

{/* WRITE A REVIEW MODAL OVERLAY FOR COMPLETED BOOKINGS */}
      {reviewFormBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative animate-zoomIn max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setReviewFormBooking(null)} 
              className="absolute top-4 right-4 text-slate-455 hover:text-slate-655 dark:hover:text-slate-200 text-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-black">Thibitisha Kukamilika & Toa Review</h2>
              <p className="text-xs text-slate-400">Tafadhali wasilisha maoni yako ya uaminifu na picha za kabla na baada ya kazi.</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-400">Ukadiriaji kwa Nyota (Rating 1-5)</label>
                <div className="flex space-x-2 text-amber-500 pt-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button 
                      key={val} 
                      type="button" 
                      onClick={() => setReviewForm({ ...reviewForm, rating: val })}
                      className="hover:scale-120 transition-transform cursor-pointer"
                    >
                      <Star className={`w-8 h-8 ${reviewForm.rating >= val ? 'fill-amber-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Maoni Yako ya Kazi (Written Review)</label>
                <textarea 
                  required 
                  rows={3} 
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Eleza jinsi kazi ilivyofanyika, ufanisi wa fundi, n.k..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl resize-none text-slate-850"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">Before Photo URL</label>
                  <input 
                    type="text" 
                    value={reviewForm.beforeImage}
                    onChange={(e) => setReviewForm({ ...reviewForm, beforeImage: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">After Photo URL</label>
                  <input 
                    type="text" 
                    value={reviewForm.afterImage}
                    onChange={(e) => setReviewForm({ ...reviewForm, afterImage: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none px-3.5 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3.5 rounded-xl shadow-md transition-all text-xs"
              >
                Thibitisha na Toa Maoni (Release Escrow Funds)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL VERIFICATION CODE DIALOG OVERLAY */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl relative animate-fadeIn text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
            <button 
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              &times;
            </button>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Uhakiki wa Barua Pepe (Email Verification)</h3>
              <p className="text-xs text-slate-400">Tafadhali weka nambari ya siri ya tarakimu 6 (Verification Code) tuliyotuma kwenye barua pepe yako ili kukamilisha usajili. (Tumia code <b>123456</b>)</p>
            </div>

            <form onSubmit={handleVerifyConfirm} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1 text-center">
                <label className="text-slate-400 block text-left">Nambari ya Siri (Code)</label>
                <input 
                  type="text" 
                  required 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="e.g. 123456" 
                  maxLength={6}
                  className="w-full bg-slate-900 border border-slate-700 outline-none px-4 py-3.5 rounded-xl text-white font-mono text-center text-lg tracking-widest font-black"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all text-xs uppercase"
              >
                Thibitisha Nambari (Verify Code)
              </button>
            </form>

            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 pt-2">
              <span>Hujapokea Code?</span>
              <button 
                type="button"
                onClick={() => {
                  setSentVerificationCode('123456');
                  showNotification('Nambari ya uhakiki imetumwa upya kwenye barua pepe yako!');
                }}
                className="text-brand-400 hover:underline"
              >
                Tuma Upya (Resend Code)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING AI ASSISTANT CHATBOT */}
      <div className="fixed bottom-6 right-6 z-40">
        {!chatbotOpen ? (
          <button 
            onClick={() => setChatbotOpen(true)}
            className="bg-brand-500 hover:bg-brand-655 text-white p-4 rounded-full shadow-2xl flex items-center justify-center relative hover:scale-105 transition-transform"
          >
            <Bot className="w-6 h-6 animate-pulse" />
          </button>
        ) : (
          <div className="w-80 h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between select-none">
            <div className="bg-brand-550 bg-brand-500 text-white p-4 flex justify-between items-center border-b border-brand-600">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span className="font-bold text-xs">AI Assistant (Msaidizi)</span>
              </div>
              <button onClick={() => setChatbotOpen(false)} className="text-white hover:text-slate-200 font-extrabold text-lg">&times;</button>
            </div>

            <div className="flex-grow p-3.5 overflow-y-auto space-y-3.5 text-[11px] font-semibold bg-slate-50/20">
              {botMessages.map((m, index) => (
                <div key={index} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2.5 rounded-2xl max-w-[85%] ${
                    m.sender === 'user' 
                      ? 'bg-brand-500 text-white rounded-tr-none' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-250 rounded-tl-none border border-slate-150 dark:border-slate-850'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-1.5">
              <input 
                type="text" 
                value={botInput}
                onChange={(e) => setBotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBotChat()}
                placeholder="Uliza chochote k.m. mabomba..." 
                className="flex-grow bg-slate-50 dark:bg-slate-800 text-[11px] px-3.5 py-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700"
              />
              <button onClick={handleBotChat} className="bg-brand-500 hover:bg-brand-600 text-white p-2.5 rounded-xl"><Send className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>

      {/* PREMIUM FOOTER */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            
            {/* Col 1: Brand & Newsletter */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                  Fundi<span className="text-brand-500">Service</span>
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                The premier marketplace for professional and verified handymen in Tanzania. Book quality services with confidence and ease.
              </p>
              
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Subscribe to our Newsletter</h4>
                <div className="flex items-center space-x-2">
                  <input type="email" placeholder="Enter your email" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm w-full outline-none focus:border-brand-500 transition-colors" />
                  <button className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors">Subscribe</button>
                </div>
              </div>
            </div>

            {/* Col 2: Company */}
            <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-brand-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Our Services</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Become a Fundi</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Business Solutions</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Blog & News</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">FAQs</a></li>
              </ul>
            </div>

            {/* Col 3: Customer Services & For Fundis */}
            <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Services</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-brand-500 transition-colors">Book a Fundi</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Track Booking</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Warranty</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Refund Policy</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Report an Issue</a></li>
              </ul>
              
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider pt-4">For Fundis</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-brand-500 transition-colors">Join as Fundi</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Fundi Dashboard</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Verification</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Training</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Col 4: Contact & Legal */}
            <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <li className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 mt-0.5 text-brand-500" />
                  <div>
                    <p>0766239486</p>
                    <p className="text-xs mt-0.5 opacity-70">Business Hours: 24/7</p>
                  </div>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-brand-500" />
                  <a href="mailto:segulesegule3@gmail.com" className="hover:text-brand-500 transition-colors">segulesegule3@gmail.com</a>
                </li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-2">
                <a href="https://wa.me/255766239486" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center space-x-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <button className="inline-flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Contact</span>
                </button>
              </div>

              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider pt-4">Legal</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Trust & Safety</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Download App:</span>
              <div className="flex space-x-2">
                <div className="bg-slate-200 dark:bg-slate-800 w-24 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-300 transition-colors">Customer App</div>
                <div className="bg-slate-200 dark:bg-slate-800 w-24 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-300 transition-colors">Fundi App</div>
                <div className="bg-slate-200 dark:bg-slate-800 w-8 h-8 rounded-lg flex items-center justify-center text-xs border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-300 transition-colors" title="QR Code Placeholder">📱</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {['Facebook', 'Instagram', 'X', 'LinkedIn', 'YouTube', 'TikTok'].map((social) => (
                <a key={social} href="#" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-50 hover:text-brand-500 dark:hover:bg-slate-700 transition-colors" title={social}>
                  <div className="w-4 h-4 bg-current opacity-70" style={{ clipPath: 'circle(50%)' }} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-8 space-y-2">
             <p className="text-xs font-semibold text-slate-400">&copy; 2026 Fundi Service System. All Rights Reserved.</p>
             <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Designed and Developed by Segule</p>
             
             {/* Admin Portal */}
             <div className="pt-4 flex justify-center">
                 <button onClick={() => setCurrentPath('admin-login' as any)} className="text-[10px] text-slate-300 dark:text-slate-700 hover:text-slate-400 transition-colors">Admin Portal</button>
             </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
