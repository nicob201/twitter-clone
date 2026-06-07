import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;

interface UserSeed {
  email: string;
  username: string;
  password: string;
  bio: string;
}

interface TweetSeed {
  username: string;
  content: string;
  daysAgo: number;
}

type FollowSeed = [string, string];
type LikeSeed = [string, number];

const USERS: UserSeed[] = [
  {
    email: 'demo@example.com',
    username: 'demo',
    password: 'password123',
    bio: 'Demo user - try logging in with this account',
  },
  {
    email: 'alice@example.com',
    username: 'alice',
    password: 'password123',
    bio: 'Full-stack developer and coffee enthusiast',
  },
  {
    email: 'bob@example.com',
    username: 'bob',
    password: 'password123',
    bio: 'Building things that matter',
  },
  {
    email: 'carol@example.com',
    username: 'carol',
    password: 'password123',
    bio: 'Designer by day, musician by night',
  },
  {
    email: 'dave@example.com',
    username: 'dave',
    password: 'password123',
    bio: 'Open source contributor',
  },
  {
    email: 'eve@example.com',
    username: 'eve',
    password: 'password123',
    bio: 'Writer, reader, thinker',
  },
  {
    email: 'frank@example.com',
    username: 'frank',
    password: 'password123',
    bio: 'Machine learning engineer',
  },
  {
    email: 'grace@example.com',
    username: 'grace',
    password: 'password123',
    bio: 'Product manager and startup advisor',
  },
  {
    email: 'hank@example.com',
    username: 'hank',
    password: 'password123',
    bio: 'DevOps & cloud infrastructure',
  },
  {
    email: 'iris@example.com',
    username: 'iris',
    password: 'password123',
    bio: 'Frontend developer. CSS is my jam',
  },
];

const TWEETS: TweetSeed[] = [
  { username: 'demo', content: 'Just deployed a new feature to production!', daysAgo: 0 },
  {
    username: 'demo',
    content: 'Working on improving the timeline algorithm this week.',
    daysAgo: 1,
  },
  {
    username: 'demo',
    content: 'Hot take: TypeScript is the best thing to happen to JavaScript.',
    daysAgo: 3,
  },
  { username: 'demo', content: 'Anyone else love the new React 19 features?', daysAgo: 5 },
  { username: 'demo', content: 'Morning coffee and code -- name a better combo.', daysAgo: 7 },
  {
    username: 'alice',
    content: 'Just finished reading "Designing Data-Intensive Applications". Highly recommend!',
    daysAgo: 1,
  },
  {
    username: 'alice',
    content: 'TIL about the structured clone algorithm in JavaScript. Mind blown.',
    daysAgo: 2,
  },
  {
    username: 'alice',
    content: 'Pair programming > solo programming. Change my mind.',
    daysAgo: 4,
  },
  { username: 'alice', content: 'Deploying on a Friday? Living dangerously!', daysAgo: 6 },
  {
    username: 'bob',
    content: 'Simplicity is the ultimate sophistication in software engineering.',
    daysAgo: 0,
  },
  { username: 'bob', content: 'Writing tests first makes me sleep better at night.', daysAgo: 3 },
  { username: 'bob', content: 'Just hit 1000 contributions on GitHub this year!', daysAgo: 10 },
  {
    username: 'carol',
    content: 'Design systems are only as good as their adoption. Make it easy to use!',
    daysAgo: 1,
  },
  {
    username: 'carol',
    content: 'Color theory in UI design is so underrated. Accessibility matters.',
    daysAgo: 4,
  },
  {
    username: 'carol',
    content: 'Learning Figma plugins development -- any good resources?',
    daysAgo: 8,
  },
  {
    username: 'dave',
    content: 'Just shipped a PR that refactored 2000 lines of legacy code. Feeling great!',
    daysAgo: 0,
  },
  {
    username: 'dave',
    content: 'Open source is not just about code -- it is about community.',
    daysAgo: 5,
  },
  { username: 'dave', content: 'My favorite debugging tool: console.log. Fight me.', daysAgo: 12 },
  {
    username: 'eve',
    content: 'Writing a blog post about the future of web development. Stay tuned!',
    daysAgo: 2,
  },
  {
    username: 'eve',
    content: 'The best time to start a blog was yesterday. The second best time is now.',
    daysAgo: 6,
  },
  { username: 'eve', content: 'Just hit publish on my latest article. Link in bio!', daysAgo: 14 },
  {
    username: 'frank',
    content: 'Training a new ML model on tweet sentiment analysis. Data is fascinating!',
    daysAgo: 1,
  },
  {
    username: 'frank',
    content: 'AI tools are great, but they can not replace understanding the fundamentals.',
    daysAgo: 7,
  },
  {
    username: 'frank',
    content: 'Hot take: feature engineering is still more important than model architecture.',
    daysAgo: 15,
  },
  {
    username: 'grace',
    content: 'Great product managers say "no" more often than they say "yes".',
    daysAgo: 2,
  },
  {
    username: 'grace',
    content: 'The best startups focus on a single problem and solve it incredibly well.',
    daysAgo: 9,
  },
  { username: 'grace', content: 'Customer interviews > gut feelings. Always.', daysAgo: 18 },
  {
    username: 'hank',
    content: 'Just migrated a production database with zero downtime. AMA!',
    daysAgo: 0,
  },
  {
    username: 'hank',
    content: 'Infrastructure as code is the only way to operate at scale.',
    daysAgo: 8,
  },
  {
    username: 'hank',
    content: 'Kubernetes is not the answer to every problem -- but it is to many.',
    daysAgo: 20,
  },
  { username: 'iris', content: 'CSS Grid changed my life. No more Bootstrap grids!', daysAgo: 3 },
  {
    username: 'iris',
    content: 'Just discovered container queries. This is huge for component design!',
    daysAgo: 11,
  },
  {
    username: 'iris',
    content: 'Web accessibility is not optional. It is a fundamental right.',
    daysAgo: 22,
  },
];

const FOLLOWS: FollowSeed[] = [
  ['demo', 'alice'],
  ['demo', 'bob'],
  ['demo', 'carol'],
  ['demo', 'dave'],
  ['demo', 'eve'],
  ['demo', 'frank'],
  ['demo', 'grace'],
  ['demo', 'hank'],
  ['demo', 'iris'],
  ['alice', 'demo'],
  ['bob', 'demo'],
  ['carol', 'demo'],
  ['dave', 'demo'],
  ['eve', 'demo'],
  ['frank', 'demo'],
  ['grace', 'demo'],
  ['hank', 'demo'],
  ['iris', 'demo'],
  ['alice', 'bob'],
  ['bob', 'alice'],
  ['alice', 'dave'],
  ['carol', 'alice'],
  ['carol', 'iris'],
  ['dave', 'eve'],
  ['eve', 'dave'],
  ['frank', 'hank'],
  ['hank', 'frank'],
  ['grace', 'alice'],
  ['iris', 'carol'],
  ['iris', 'alice'],
  ['bob', 'eve'],
  ['frank', 'alice'],
  ['hank', 'grace'],
  ['grace', 'hank'],
];

const LIKES: LikeSeed[] = [
  ['demo', 0],
  ['demo', 5],
  ['demo', 9],
  ['demo', 12],
  ['demo', 15],
  ['alice', 0],
  ['alice', 3],
  ['alice', 9],
  ['alice', 15],
  ['alice', 21],
  ['bob', 0],
  ['bob', 4],
  ['bob', 12],
  ['bob', 18],
  ['bob', 27],
  ['carol', 1],
  ['carol', 5],
  ['carol', 10],
  ['carol', 15],
  ['carol', 22],
  ['dave', 2],
  ['dave', 6],
  ['dave', 11],
  ['dave', 19],
  ['dave', 25],
  ['eve', 0],
  ['eve', 7],
  ['eve', 13],
  ['eve', 16],
  ['eve', 28],
  ['frank', 3],
  ['frank', 8],
  ['frank', 14],
  ['frank', 20],
  ['frank', 29],
  ['grace', 4],
  ['grace', 6],
  ['grace', 15],
  ['grace', 22],
  ['grace', 27],
  ['hank', 1],
  ['hank', 9],
  ['hank', 17],
  ['hank', 21],
  ['hank', 30],
  ['iris', 2],
  ['iris', 10],
  ['iris', 16],
  ['iris', 24],
  ['iris', 31],
];

async function main(): Promise<void> {
  console.log('Clearing existing data...');
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.tweet.deleteMany();
  await prisma.user.deleteMany();

  console.log('Generating password hashes...');
  const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);

  console.log(`Creating ${USERS.length} users...`);
  const userMap = new Map<string, string>();

  for (const userData of USERS) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        passwordHash,
        bio: userData.bio,
      },
    });
    userMap.set(userData.username, user.id);
  }

  console.log(`Creating ${TWEETS.length} tweets...`);
  const tweetIds: string[] = [];

  for (const tweetData of TWEETS) {
    const authorId = userMap.get(tweetData.username);
    if (!authorId) continue;

    const tweet = await prisma.tweet.create({
      data: {
        content: tweetData.content,
        authorId,
        createdAt: new Date(Date.now() - tweetData.daysAgo * 24 * 60 * 60 * 1000),
      },
    });
    tweetIds.push(tweet.id);
  }

  console.log(`Creating ${FOLLOWS.length} follows...`);
  for (const [followerUsername, followingUsername] of FOLLOWS) {
    const followerId = userMap.get(followerUsername);
    const followingId = userMap.get(followingUsername);
    if (!followerId || !followingId) continue;

    await prisma.follow.create({ data: { followerId, followingId } });
  }

  console.log(`Creating ${LIKES.length} likes...`);
  for (const [username, tweetIndex] of LIKES) {
    const userId = userMap.get(username);
    const tweetId = tweetIds[tweetIndex];
    if (!userId || !tweetId) continue;

    await prisma.like.create({ data: { userId, tweetId } });
  }

  const demoUserId = userMap.get('demo');
  console.log('---');
  console.log('Seed complete!');
  console.log(`  Users:     ${USERS.length}`);
  console.log(`  Tweets:    ${TWEETS.length}`);
  console.log(`  Follows:   ${FOLLOWS.length}`);
  console.log(`  Likes:     ${LIKES.length}`);
  console.log(`  Demo ID:   ${demoUserId}`);
  console.log('---');
  console.log('Demo login:');
  console.log('  Email:    demo@example.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
