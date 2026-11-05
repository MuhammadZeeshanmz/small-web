export const PEOPLE = ['Amina', 'Bilal', 'Chen', 'Dara', 'Eli'];

export const SITES: { address: string; title: string; author: string; html: string }[] = [
  {
    address: 'tidepool.zz',
    title: 'Tidepool Diaries',
    author: 'Amina',
    html: `<h1>Tidepool Diaries</h1>
<p>Twice a day the sea pulls back and leaves a handful of small worlds behind. A tidepool is a pocket of saltwater trapped in the rock, and everything inside it has to survive heat, salt and the next wave. Limpets clamp down on the stone, hermit crabs borrow empty shells, and anemones close up like fists until the water returns.</p>
<p>To read the tide tables before you go, ask the keeper at <a href="lighthouse.zz">the lighthouse</a>. For the quieter, muddier cousin of this shore, walk inland to the <a href="saltmarsh.zz">salt marsh</a>. I once heard of a notebook about a second light along this coast, but <a href="lost-lighthouse.zz">its page</a> never loaded.</p>`,
  },
  {
    address: 'saltmarsh.zz',
    title: 'The Salt Marsh',
    author: 'Amina',
    html: `<h1>The Salt Marsh</h1>
<p>Where a river meets the sea, the land goes soft. Cordgrass holds the mud together, and at high tide the whole marsh floods and drains through a maze of creeks. Young fish hide in the grass while wading birds work the edges at low water.</p>
<p>Marshes also soak up storm surges, which is why losing them makes coastal towns nervous. Herons hunt here at dusk, and on clear nights it is the best place near me to watch the stars, see <a href="night-sky.zz">the dark sky notebook</a>. Back to the rocks: <a href="tidepool.zz">Tidepool Diaries</a>. Everything else lives in <a href="index.zz">the index</a>.</p>`,
  },
  {
    address: 'lighthouse.zz',
    title: "Keeper's Log",
    author: 'Amina',
    html: `<h1>Keeper's Log</h1>
<p>The lamp turns once every twelve seconds. My job is simple to describe: keep the light burning, wipe the salt off the lens, and write down what the weather did. Big ships rarely need the light now, since they carry satellites, but small boats still count on it on foggy nights.</p>
<p>If you want to steer by hand, start with <a href="compass-rose.zz">the compass rose</a>. The tide timetable I keep is useful at <a href="tidepool.zz">the tidepools</a>. The old keepers had a union once, but <a href="keepers-union.zz">its page</a> is long gone.</p>`,
  },
  {
    address: 'sourdough.zz',
    title: 'Notes on Sourdough',
    author: 'Bilal',
    html: `<h1>Notes on Sourdough</h1>
<p>A sourdough starter is flour and water left alone long enough for wild yeast and bacteria to move in. Feed it daily and it bubbles, smells like sour apples, and will lift a loaf without any packet yeast. Hydration, temperature and patience matter more than any recipe.</p>
<p>Bake in a preheated clay pot so the crust gets steam, mine came from <a href="kiln.zz">the kiln log</a>. A spoon of honey from <a href="beekeeping.zz">the hives</a> feeds the yeast nicely. More small pages are listed in <a href="index.zz">the index</a>.</p>`,
  },
  {
    address: 'kiln.zz',
    title: 'Kiln Log',
    author: 'Bilal',
    html: `<h1>Kiln Log</h1>
<p>Clay remembers everything. A pot dried too quickly cracks, a glaze fired too hot runs off the shelf, and a kiln opened too early ruins a week of work. I fire to 1240 degrees and then wait a full day before touching the door.</p>
<p>Wood ash from the <a href="mushroom-log.zz">mushroom grower's oak logs</a> makes a lovely pale green glaze. The pots end up in the kitchen, mostly for <a href="sourdough.zz">sourdough</a>. I lost my glaze recipes when <a href="glaze-recipes.zz">that page</a> disappeared.</p>`,
  },
  {
    address: 'beekeeping.zz',
    title: 'Eight Frames',
    author: 'Chen',
    html: `<h1>Eight Frames</h1>
<p>A healthy hive holds about fifty thousand bees in summer and a third of that in winter. The queen lays, and the workers nurse, build, guard and finally forage until their wings wear out. I inspect every ten days, look for eggs, and leave the bees alone on cold mornings.</p>
<p>My bees work the flowers of <a href="saltmarsh.zz">the salt marsh</a> in late summer. The darkest honey goes to a baker who writes about <a href="sourdough.zz">sourdough</a>. Browse more at <a href="index.zz">the index</a>.</p>`,
  },
  {
    address: 'night-sky.zz',
    title: 'Dark Sky Notebook',
    author: 'Dara',
    html: `<h1>Dark Sky Notebook</h1>
<p>Away from town lights the sky has depth. Let your eyes adapt for twenty minutes with no phone, and the Milky Way shows up as a pale road. Start with the Plough, follow its pointer stars to the pole star, and everything else hangs from that.</p>
<p>Sailors used these stars long before <a href="compass-rose.zz">the compass</a> was common. The moon also drives the tides, see <a href="tidepool.zz">the tidepools</a>. I never finished my <a href="meteor-calendar.zz">meteor calendar</a>.</p>`,
  },
  {
    address: 'compass-rose.zz',
    title: 'Compass Rose',
    author: 'Dara',
    html: `<h1>Compass Rose</h1>
<p>Before satellites you needed three things to find your way: a heading, a clock and a good memory. A magnetic compass points near true north but not exactly. The gap is called declination, and it changes by place and by year.</p>
<p>Dead reckoning is just speed multiplied by time along a heading, corrected whenever you see something you recognise, like <a href="lighthouse.zz">a lighthouse</a> or a star from <a href="night-sky.zz">the night sky</a>. My old chart collection is at <a href="old-charts.zz">old-charts</a>, or it was.</p>`,
  },
  {
    address: 'mushroom-log.zz',
    title: 'Shiitake on Oak',
    author: 'Eli',
    html: `<h1>Shiitake on Oak</h1>
<p>Mushrooms are only the fruit. The real organism is a web of threads running through the wood. I drill holes in fresh oak logs, tap in sawdust spawn, seal each hole with wax and then wait a year before the first flush.</p>
<p>A cold soak wakes the logs up, and a week later the caps appear. Spent logs go to <a href="kiln.zz">the potter</a> for ash. My neighbour's hives are described at <a href="beekeeping.zz">Eight Frames</a>. More pages: <a href="index.zz">the index</a>.</p>`,
  },
  {
    address: 'index.zz',
    title: 'The Small Index',
    author: 'Eli',
    html: `<h1>The Small Index</h1>
<p>A hand-kept list of what lives here.</p>
<ul>
<li><a href="tidepool.zz">Tidepool Diaries</a>, life between the tides</li>
<li><a href="saltmarsh.zz">The Salt Marsh</a>, where river meets sea</li>
<li><a href="lighthouse.zz">Keeper's Log</a>, a lamp and a notebook</li>
<li><a href="sourdough.zz">Notes on Sourdough</a>, wild yeast</li>
<li><a href="kiln.zz">Kiln Log</a>, clay and fire</li>
<li><a href="beekeeping.zz">Eight Frames</a>, a backyard hive</li>
<li><a href="night-sky.zz">Dark Sky Notebook</a>, stargazing</li>
<li><a href="compass-rose.zz">Compass Rose</a>, finding your way</li>
<li><a href="mushroom-log.zz">Shiitake on Oak</a>, growing mushrooms</li>
<li><a href="the-big-search.zz">The Big Search</a>, a page that was never written</li>
</ul>`,
  },
];