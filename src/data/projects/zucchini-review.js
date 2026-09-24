export default {
    id: 'zucchini-review',
    title: 'Zucchini Review',
    category: 'ENTERTAINMENT • FEB 2024',
    year: 'FEB 2024',
    description: 'A Vue film-discovery and review platform where one title carries five community rating axes and the written reviews behind them.',
    fullDescription: 'Zucchini Review is a five-person Vue 3 coursework project. The browser reads catalogue and film data from TMDB, stores users, ratings, reviews, genres, and liked-review relationships in Supabase tables, and uses Pinia plus localStorage for its browser-side identity state. Signed-in users can submit five 0–100 ratings with one written review, then revisit their Reviewed list to edit or delete it.',
    tags: ['Vue 3', 'Supabase', 'Pinia', 'Tailwind CSS', 'TMDB API'],
    coverImage: '/assets/previews/zucchini-homepage-live.png',
    heroMedia: { image: '/assets/previews/zucchini-homepage-live.png' },
    link: 'https://zuchini-review.vercel.app/',
    repo: 'https://github.com/Xsmitylnwza/Zuchini-Review',
    code: `const categoryMeans = categories.map((category) =>
  reviews.reduce((sum, review) => sum + review.ratings[category], 0)
  / reviews.length
);

const zucchinitor = categoryMeans.reduce((sum, value) => sum + value, 0)
  / categoryMeans.length;`,
    gallery: [
      { image: '/assets/previews/zucchini-review-result-repo.png' },
      { image: '/assets/previews/zucchini-reviewed-repo.png' },
      { image: '/assets/previews/zucchini-login-live.png' }
    ],
    galleryLabels: ['Five-axis review result', 'Reviewed list', 'Sign-in boundary'],
    galleryKinds: ['Repository demo still', 'Repository demo still', 'Live still'],
    galleryDescriptions: [
      'Category means, the ordinary five-category mean, review text, likes, sorting, and pagination remain visible on the film page.',
      'A signed-in user returns to their own submitted reviews with explicit Edit and Delete controls.',
      'The deployed sign-in screen hands browser-side identity into Pinia and localStorage; it is not Supabase Auth.',
    ],
    flow: [
      {
        step: '01',
        title: 'Discover',
        body: 'Search TMDB-backed titles or browse the genre shelves rendered on the homepage.',
        cue: 'search · shelves · TMDB',
      },
      {
        step: '02',
        title: 'Open a film',
        body: 'Read TMDB details alongside the stored ratings and reviews associated with one movieId.',
        cue: 'one title context',
      },
      {
        step: '03',
        title: 'Rate & review',
        body: 'Set five independent 0–100 values and submit one written review after signing in.',
        cue: 'human submit',
      },
      {
        step: '04',
        title: 'Read the result',
        body: 'The browser calculates each category mean and then the ordinary mean of those five values.',
        cue: 'ordinary mean',
      },
      {
        step: '05',
        title: 'Revisit Reviewed',
        body: 'The same signed-in user can reopen the editor or explicitly delete a submitted review.',
        cue: 'edit · delete',
      },
    ],
    why: [
      {
        title: 'Film context first',
        body: 'TMDB discovery leads into one title view before the product asks for an opinion.',
      },
      {
        title: 'Five signals, one read',
        body: 'Zucchinitor exposes all five category means and derives one ordinary overall mean.',
      },
      {
        title: 'Human-owned review',
        body: 'Writing, liking, editing, and deleting remain explicit user actions.',
      },
    ],
    role: 'Frontend Developer'
  };
