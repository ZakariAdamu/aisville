import { ID } from 'react-native-appwrite';
import { config, databases } from './appwrite';
import { agentImages, galleryImages, propertiesImages, reviewImages } from './data';

const COLLECTIONS = {
  AGENT: config.agentsTableId,
  REVIEWS: config.reviewsTableId,
  GALLERY: config.galleriesTableId,
  PROPERTY: config.propertiesTableId,
};

const propertyTypes = [
  'House',
  'Townhouse',
  'Condo',
  'Duplex',
  'Studio',
  'Villa',
  'Apartment',
  'Other',
];

const facilities = ['laundry', 'parking', 'gym', 'wifi', 'pet-friendly', 'swimming-pool'];

const propertyNames = [
  'Maple Grove Retreat',
  'Sunset Ridge House',
  'Cedar Point Duplex',
  'Riverstone Villa',
  'Willow Creek Townhouse',
  'Oak Haven Apartment',
  'Lakeside Breeze Condo',
  'Pineview Studio',
  'Golden Elm Residence',
  'Harbor Light Home',
  'Bluebird Nest Duplex',
  'Silver Birch Estate',
  'Coral Gate Apartment',
  'Moonstone Manor',
  'Palm Court Villa',
  'Jade Valley House',
  'Ivy Terrace Townhouse',
  'Meadowline Condo',
  'Northwind Loft',
  'Sapphire Hill Retreat',
];

const propertyDescriptions = [
  'A serene family home with airy living spaces, mature trees, and a peaceful street ideal for evening walks.',
  'A bright, modern residence with open-plan interiors, premium finishes, and quick access to key city routes.',
  'A practical duplex designed for comfort, offering spacious bedrooms and a cozy private outdoor corner.',
  'An elegant villa with generous natural light, stylish detailing, and a calm environment for relaxed living.',
  'A warm townhouse featuring smart storage, balanced room proportions, and easy access to nearby essentials.',
  'A contemporary apartment that blends comfort and convenience with a clean layout and welcoming atmosphere.',
  'A polished condo with tasteful interiors, strong security, and a layout that suits both individuals and couples.',
  'A compact studio optimized for modern city life, complete with efficient space planning and inviting finishes.',
  'A refined residence with standout curb appeal, flexible living areas, and a neighborhood known for tranquility.',
  'A charming home near daily conveniences, offering practical room flow and dependable amenities year-round.',
  'A well-kept duplex with family-friendly proportions, quiet surroundings, and a layout built for daily ease.',
  'A spacious estate-style property with elegant touches, broad living zones, and strong long-term comfort value.',
  'A centrally placed apartment with neat finishes, excellent ventilation, and smooth access to public transport.',
  'A distinctive home with character, privacy, and a balanced mix of style and functional design throughout.',
  'A premium villa with tasteful architecture, bright interiors, and a calm residential atmosphere.',
  'A comfortable house with practical design choices, solid utility access, and generous living flexibility.',
  'A stylish townhouse that feels both cozy and modern, with quality detailing across key living spaces.',
  'A clean, modern condo with efficient room planning and a pleasant setting ideal for everyday routines.',
  'A loft-inspired space with open visual flow, urban convenience, and a layout suited to modern lifestyles.',
  'A peaceful retreat with great indoor-outdoor balance, quality fittings, and a welcoming neighborhood feel.',
];

const abujaLocations = [
  { address: '1 Aguiyi Ironsi Street, Maitama, Abuja', geolocation: '9.0820, 7.5105' },
  { address: 'Bala Sokoto Way, Jabi, Abuja', geolocation: '9.0861, 7.4319' },
  {
    address: 'Adetokunbo Ademola Crescent, Wuse 2, Abuja',
    geolocation: '9.0786, 7.4898',
  },
  { address: 'Aminu Kano Crescent, Wuse 2, Abuja', geolocation: '9.0808, 7.4836' },
  { address: 'Gana Street, Maitama, Abuja', geolocation: '9.0852, 7.5038' },
  { address: 'Mississippi Street, Maitama, Abuja', geolocation: '9.0904, 7.4959' },
  { address: 'Shehu Shagari Way, Central Area, Abuja', geolocation: '9.0469, 7.5014' },
  {
    address: 'Herbert Macaulay Way, Central Business District, Abuja',
    geolocation: '9.0614, 7.4957',
  },
  { address: 'Independence Avenue, Central Area, Abuja', geolocation: '9.0437, 7.4899' },
  { address: 'Olusegun Obasanjo Way, Wuse Zone 7, Abuja', geolocation: '9.0619, 7.4692' },
  { address: 'Alex Ekwueme Way, Jabi, Abuja', geolocation: '9.0781, 7.4451' },
  { address: 'Ladi Kwali Street, Wuse Zone 4, Abuja', geolocation: '9.0715, 7.4782' },
  { address: 'Kashim Ibrahim Way, Wuse 2, Abuja', geolocation: '9.0837, 7.4852' },
  { address: 'Muhammadu Buhari Way, Central Area, Abuja', geolocation: '9.0546, 7.5032' },
  { address: 'Nnamdi Azikiwe Expressway, Garki, Abuja', geolocation: '9.0218, 7.4839' },
  { address: 'Ahmadu Bello Way, Garki 2, Abuja', geolocation: '9.0396, 7.4988' },
  { address: 'Moshood Abiola Way, Utako, Abuja', geolocation: '9.0679, 7.4456' },
  {
    address: 'Ademola Adetokunbo Crescent, Wuse 2, Abuja',
    geolocation: '9.0779, 7.4915',
  },
  { address: 'Tafawa Balewa Way, Area 11, Garki, Abuja', geolocation: '9.0326, 7.4937' },
  { address: 'Ahmadu Bello Way, Mabushi, Abuja', geolocation: '9.1041, 7.4407' },
];

const agentProfiles = [
  { name: 'Amara Okafor', email: 'amara.okafor@aisville.com' },
  { name: 'Daniel Mensah', email: 'daniel.mensah@aisville.com' },
  { name: 'Laila Hassan', email: 'laila.hassan@aisville.com' },
  { name: 'Tunde Adeyemi', email: 'tunde.adeyemi@aisville.com' },
  { name: 'Nadia Suleiman', email: 'nadia.suleiman@aisville.com' },
];

const reviewerNames = [
  'Amina Yusuf',
  'Chinedu Okoye',
  'Fatima Bello',
  'Kelvin Asante',
  'Mariam Abubakar',
  'Samuel Nkrumah',
  'Zainab Idris',
  'Ibrahim Lawal',
  'Nora Adjei',
  'Oluwatobi Afolabi',
  'Hauwa Musa',
  'David Boateng',
  'Ruth Eze',
  'Kofi Owusu',
  'Grace Nwosu',
  'Yusuf Abdullahi',
  'Abena Quartey',
  'Bashir Garba',
  'Efe Ighalo',
  'Lydia Appiah',
];

const reviewTexts = [
  'Great location and very quiet neighborhood. The process was smooth from viewing to move-in.',
  'The apartment matched the listing photos exactly. Clean finishes and responsive agent support.',
  'Spacious rooms and good natural light. I especially liked the secure parking area.',
  'Nice property overall, and the nearby shops made daily errands easy.',
  'Well-maintained building with reliable water and power. Would definitely recommend.',
  'Loved the layout and ventilation. The host and agent communicated clearly throughout.',
  'Good value for the price. The environment felt safe even late in the evening.',
  'The facilities were in good condition and the neighborhood was family-friendly.',
  'Smooth inspection and paperwork. Everything promised in the listing was available.',
  'Very comfortable home with modern fittings. Internet and utilities were stable.',
  'Excellent for remote work, quiet surroundings and plenty of space.',
  'The location is central and commute time is short. Overall a pleasant experience.',
  'Beautiful interior and tidy compound. Agent was punctual for every appointment.',
  'I appreciated the security and cleanliness. The property is worth considering.',
  'Bright rooms, good finishing, and easy access roads. I had no major issues.',
  'Everything felt organized and professional. The check-in experience was hassle-free.',
  'The gallery was accurate and the unit looked even better in person.',
  'Great ambiance and very practical layout. Good option for small families.',
  'Quiet compound, clean water supply, and helpful management team.',
  'A solid choice if you want comfort and convenience in one place.',
];

function getRandomSubset<T>(array: T[], minItems: number, maxItems: number): T[] {
  if (minItems > maxItems) {
    throw new Error('minItems cannot be greater than maxItems');
  }
  if (minItems < 0 || maxItems > array.length) {
    throw new Error('minItems or maxItems are out of valid range for the array');
  }

  // Generate a random size for the subset within the range [minItems, maxItems]
  const subsetSize = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;

  // Create a copy of the array to avoid modifying the original
  const arrayCopy = [...array];

  // Shuffle the array copy using Fisher-Yates algorithm
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[randomIndex]] = [arrayCopy[randomIndex], arrayCopy[i]];
  }

  // Return the first `subsetSize` elements of the shuffled array
  return arrayCopy.slice(0, subsetSize);
}

async function seed() {
  console.log('Seeding data...');

  try {
    // Clear existing data from all collections
    for (const key in COLLECTIONS) {
      const collectionId = COLLECTIONS[key as keyof typeof COLLECTIONS];
      const documents = await databases.listDocuments({
        databaseId: config.databaseId!,
        collectionId: collectionId!,
      });
      for (const doc of documents.documents) {
        await databases.deleteDocument({
          databaseId: config.databaseId!,
          collectionId: collectionId!,
          documentId: doc.$id,
        });
      }
    }

    console.log('Cleared all existing data.');

    // Seed Agents
    const agents = [];
    for (let i = 1; i <= 5; i++) {
      const profile = agentProfiles[i - 1];
      const agent = await databases.createDocument({
        databaseId: config.databaseId!,
        collectionId: COLLECTIONS.AGENT!,
        documentId: ID.unique(),
        data: {
          name: profile?.name ?? `Agent ${i}`,
          email: profile?.email ?? `agent${i}@aisville.com`,
          avatar: agentImages[Math.floor(Math.random() * agentImages.length)],
        },
      });
      agents.push(agent);
    }
    console.log(`Seeded ${agents.length} agents.`);

    // Seed Reviews
    const reviews = [];
    for (let i = 1; i <= 20; i++) {
      const reviewerName = reviewerNames[i - 1] ?? `Reviewer ${i}`;
      const reviewText = reviewTexts[i - 1] ?? 'Great property with a smooth rental experience.';

      const review = await databases.createDocument({
        databaseId: config.databaseId!,
        collectionId: COLLECTIONS.REVIEWS!,
        documentId: ID.unique(),
        data: {
          name: reviewerName,
          avatar: reviewImages[Math.floor(Math.random() * reviewImages.length)],
          review: reviewText,
          rating: Math.floor(Math.random() * 5) + 1, // Rating between 1 and 5
        },
      });
      reviews.push(review);
    }
    console.log(`Seeded ${reviews.length} reviews.`);

    // Seed Galleries
    const galleries = [];
    for (const image of galleryImages) {
      const gallery = await databases.createDocument({
        databaseId: config.databaseId!,
        collectionId: COLLECTIONS.GALLERY!,
        documentId: ID.unique(),
        data: { image },
      });
      galleries.push(gallery);
    }

    console.log(`Seeded ${galleries.length} galleries.`);

    // Seed Properties
    for (let i = 1; i <= 20; i++) {
      const assignedAgent = agents[Math.floor(Math.random() * agents.length)];
      const propertyName = propertyNames[i - 1] ?? `Unique Property ${i}`;
      const propertyDescription =
        propertyDescriptions[i - 1] ??
        `${propertyName} offers a comfortable layout, reliable amenities, and a location that supports easy everyday living.`;
      const propertyLocation = abujaLocations[i - 1] ?? {
        address: 'Adetokunbo Ademola Crescent, Wuse 2, Abuja',
        geolocation: '9.0786, 7.4898',
      };

      const assignedReviews = getRandomSubset(reviews, 5, 7); // 5 to 7 reviews
      const assignedGalleries = getRandomSubset(galleries, 3, 8); // 3 to 8 galleries

      const selectedFacilities = facilities
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * facilities.length) + 1);

      const image =
        propertiesImages.length - 1 >= i
          ? propertiesImages[i]
          : propertiesImages[Math.floor(Math.random() * propertiesImages.length)];

      const property = await databases.createDocument({
        databaseId: config.databaseId!,
        collectionId: COLLECTIONS.PROPERTY!,
        documentId: ID.unique(),
        data: {
          name: propertyName,
          type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
          description: propertyDescription,
          address: propertyLocation.address,
          geolocation: propertyLocation.geolocation,
          price: Math.floor(Math.random() * 9000) + 1000,
          area: Math.floor(Math.random() * 3000) + 500,
          bedrooms: Math.floor(Math.random() * 5) + 1,
          bathrooms: Math.floor(Math.random() * 5) + 1,
          rating: Math.floor(Math.random() * 5) + 1,
          favoritesCount: 0,
          facilities: selectedFacilities,
          image: image,
          agent: assignedAgent.$id,
          reviews: assignedReviews.map((review) => review.$id),
          gallery: assignedGalleries.map((gallery) => gallery.$id),
        },
      });

      console.log(`Seeded property: ${property.name}`);
    }

    console.log('Data seeding completed.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

export default seed;
