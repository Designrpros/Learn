
export interface OutlineItem {
    title: string;
    icon?: string;
    children?: OutlineItem[];
}

export const WIKIPEDIA_OUTLINE: OutlineItem[] = [
    {
        title: "General Reference",
        icon: "Library",
        children: [
            {
                title: "Books",
                icon: "Book",
                children: [
                    { title: "Great Books", icon: "BookOpen" },
                    { title: "Harvard Classics", icon: "Bookmark" }
                ]
            },
            {
                title: "Knowledge",
                icon: "BrainCircuit",
                children: [
                    { title: "Academic Disciplines", icon: "GraduationCap" },
                    { title: "Library Classification", icon: "ListOrdered" },
                    { title: "Dewey Decimal", icon: "Hash" }
                ]
            },
            { title: "Wikipedia", icon: "Globe2" }
        ]
    },
    {
        title: "Culture and the Arts",
        icon: "Palette",
        children: [
            {
                title: "Culture",
                icon: "UsersRound",
                children: [
                    { title: "Beliefs & Customs", icon: "HandHeart" }
                ]
            },
            {
                title: "The Arts",
                icon: "Brush",
                children: [
                    {
                        title: "Literature",
                        icon: "Feather",
                        children: [
                            { title: "Fiction", icon: "BookType" },
                            { title: "Poetry", icon: "Scroll" }
                        ]
                    },
                    {
                        title: "Visual Arts",
                        icon: "Eye",
                        children: [
                            { title: "Animation", icon: "Clapperboard" },
                            { title: "Architecture", icon: "Building2" },
                            { title: "Design", icon: "PencilRuler" },
                            { title: "Film", icon: "Film" },
                            { title: "Painting", icon: "Paintbucket" },
                            { title: "Photography", icon: "Camera" },
                            { title: "Sculpture", icon: "Gavel" }
                        ]
                    },
                    {
                        title: "Performing Arts",
                        icon: "Mic2",
                        children: [
                            { title: "Acting", icon: "Drama" },
                            { title: "Dance", icon: "Move" },
                            { title: "Magic", icon: "Wand2" },
                            { title: "Theatre", icon: "Curtains" }
                        ]
                    },
                    {
                        title: "Music",
                        icon: "Music",
                        children: [
                            { title: "Classical Music", icon: "Music2" },
                            { title: "Jazz", icon: "Music" },
                            { title: "Opera", icon: "Mic" },
                            { title: "Musical Instruments", icon: "Guitar" }
                        ]
                    }
                ]
            },
            {
                title: "Gastronomy",
                icon: "Utensils",
                children: [
                    { title: "Food Preparation", icon: "ChefHat" },
                    { title: "Cuisines", icon: "Soup" },
                    { title: "Coffee & Tea", icon: "Coffee" },
                    { title: "Alcoholic Beverages", icon: "Beer" }
                ]
            },
            {
                title: "Recreation",
                icon: "Tent",
                children: [
                    { title: "Festivals", icon: "Confetti" }, // Confetti -> PartyPopper
                    { title: "Tourism", icon: "Luggage" },
                    { title: "Hobbies", icon: "Puzzle" }
                ]
            },
            {
                title: "Games & Sports",
                icon: "Trophy",
                children: [
                    { title: "Board Games", icon: "Dice5" },
                    { title: "Video Games", icon: "Gamepad2" },
                    { title: "Ball Sports", icon: "Volleyball" },
                    { title: "Combat Sports", icon: "Swords" },
                    { title: "Racing", icon: "FlagCheckered" }
                ]
            }
        ]
    },
    {
        title: "Geography and Places",
        icon: "Map",
        children: [
            {
                title: "Continents",
                icon: "Globe",
                children: [
                    { title: "Africa", icon: "MapPin" },
                    { title: "Antarctica", icon: "ThermometerSnowflake" },
                    { title: "Asia", icon: "MapPin" },
                    { title: "Europe", icon: "MapPin" },
                    { title: "North America", icon: "MapPin" },
                    { title: "South America", icon: "MapPin" },
                    { title: "Oceania", icon: "MapPin" }
                ]
            },
            {
                title: "Physical Geography",
                icon: "Mountain",
                children: [
                    { title: "Landforms", icon: "MountainSnow" },
                    { title: "Bodies of Water", icon: "Waves" },
                    { title: "Atmosphere", icon: "Cloud" }
                ]
            }
        ]
    },
    {
        title: "Health and Fitness",
        icon: "HeartPulse",
        children: [
            { title: "Exercise", icon: "Dumbbell" },
            { title: "Nutrition", icon: "Apple" },
            {
                title: "Medicine",
                icon: "Stethoscope",
                children: [
                    { title: "Dentistry", icon: "Smile" },
                    { title: "Cardiology", icon: "Heart" },
                    { title: "Psychiatry", icon: "Brain" },
                    { title: "Surgery", icon: "Scalpel" }
                ]
            },
            { title: "Public Health", icon: "Hospital" }
        ]
    },
    {
        title: "History and Events",
        icon: "Hourglass",
        children: [
            { title: "Prehistory", icon: "Bone" },
            { title: "Ancient History", icon: "Landmark" },
            { title: "Middle Ages", icon: "Castle" },
            { title: "Modern History", icon: "Factory" },
            { title: "Military History", icon: "ShieldAlert" },
            { title: "Wars", icon: "Swords" }
        ]
    },
    {
        title: "Human Activities",
        icon: "PersonStanding",
        children: [
            { title: "Agriculture", icon: "Tractor" },
            { title: "Communication", icon: "Megaphone" },
            { title: "Education", icon: "School" },
            { title: "Industry", icon: "Factory" },
            { title: "Law", icon: "Gavel" },
            { title: "Politics", icon: "Vote" }
        ]
    },
    {
        title: "Mathematics and Logic",
        icon: "Sigma",
        children: [
            { title: "Arithmetic", icon: "Calculator" },
            { title: "Algebra", icon: "Variable" },
            { title: "Geometry", icon: "Triangle" },
            { title: "Statistics", icon: "BarChart3" },
            { title: "Logic", icon: "Binary" }
        ]
    },
    {
        title: "Natural Sciences",
        icon: "Atom",
        children: [
            {
                title: "Biology",
                icon: "Dna",
                children: [
                    { title: "Botany", icon: "Flower2" },
                    { title: "Zoology", icon: "Cat" },
                    { title: "Genetics", icon: "Fingerprint" },
                    { title: "Ecology", icon: "Leaf" }
                ]
            },
            {
                title: "Physical Sciences",
                icon: "FlaskConical",
                children: [
                    { title: "Chemistry", icon: "FlaskRound" },
                    { title: "Physics", icon: "Orbit" },
                    { title: "Astronomy", icon: "Telescope" },
                    { title: "Earth Science", icon: "Earth" }
                ]
            }
        ]
    },
    {
        title: "People and Self",
        icon: "UserCircle2",
        children: [
            { title: "Self", icon: "UserCheck" },
            { title: "Children", icon: "Baby" },
            { title: "Relationships", icon: "HeartHandshake" },
            { title: "Famous People", icon: "Star" }
        ]
    },
    {
        title: "Philosophy",
        icon: "Lightbulb",
        children: [
            { title: "Ethics", icon: "Scale" },
            { title: "Epistemology", icon: "Search" },
            { title: "Metaphysics", icon: "Ghost" },
            { title: "Logic (Phil)", icon: "Workflow" }
        ]
    },
    {
        title: "Religion",
        icon: "Sparkles",
        children: [
            { title: "Abrahamic", icon: "Book" },
            { title: "Eastern", icon: "Sun" },
            { title: "Indian", icon: "Flower" },
            { title: "Mythology", icon: "Scroll" },
            { title: "Spirituality", icon: "Wind" }
        ]
    },
    {
        title: "Society",
        icon: "Users",
        children: [
            { title: "Business", icon: "Briefcase" },
            { title: "Economics", icon: "Banknote" },
            { title: "Media", icon: "Newspaper" },
            { title: "Politics", icon: "Landmark" }, // Duplicate with Human Activities OK
            { title: "Sociology", icon: "Network" }
        ]
    },
    {
        title: "Technology",
        icon: "Cpu",
        children: [
            { title: "Computing", icon: "Laptop" },
            { title: "Electronics", icon: "Zap" },
            { title: "Engineering", icon: "Wrench" },
            { title: "Transport", icon: "Truck" },
            { title: "Biotechnology", icon: "TestTube2" }
        ]
    }
];
