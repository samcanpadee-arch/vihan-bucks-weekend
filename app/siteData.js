export const accommodation = {
  label: 'Base camp',
  status: 'Booked',
  name: 'Yarra Glen Airbnb Estate',
  dates: 'June 26 – June 28, 2026',
  address: 'TBC once shared',
  note: 'Address and check-in details will be added once confirmed, so nobody has to scroll through old messages like an archaeologist.',
  description: 'Accommodation is already booked. This is where everyone eventually needs to end up.',
  linkLabel: 'Airbnb link',
  link: 'https://www.airbnb.com.au/rooms/1561866387856977252?source_impression_id=p3_1776992856_P3BRBi61hmW3JbmH',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAWOjNCqmZTNLeJ1zl8g2cfwyETsA6rEuKHYT5V2QxA8iX7lmvfZqPNFKMN47SIq9akWxiYWs00tt7C_aWSZxIc3rzgDOP3d8eeJDozHxu5d7MRplHkwSp1Y2QYRmouj3g6BCWjsLjRPmOrqnQ1KCo9awWFQ1cX2IvhN5zzAxYIoT502d-AQH4jrcy9uoGiPjC1Tkh5XiQQ5nMO2osRohSDpZmw8rf8foV410LqiQCg2h2cg3PZh3Cq57G1gO5m9P3N1QPk41oDnoM',
  imageAlt: 'Luxury countryside Airbnb house in Yarra Valley at sunset'
};

export const votingSections = [
  {
    key: 'fridayNight',
    day: 'Friday',
    title: 'Friday night',
    subtitle: 'The Arrival',
    icon: 'nightlife',
    options: [
      {
        id: 'friday-pizza-oven',
        cost: 'Shared grocery cost',
        title: 'Pizza oven night',
        description:
          'Sam brings the pizza oven, we make pizzas, everyone helps, and nobody gets to stand around doing fake supervision with a beer.',
        meta: ['Friday evening', 'Flexible', 'Shared grocery cost'],
        vibe: 'High stakes',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCrH-m34CP_D9VNZKMhnBwjPcte38Qjx4EBE6jckRKWxfxuT6eMdNcgVz_YZV6Ifh2cbqkckhF2nVRmDf1Va0IUjjJs1C4_aYgb79KalscZHwnJG-l53cdeZPyPEtnM7V3B1xF27YtjRJAq8CrLqq3OAaaJrlyvclweDvIbMEYd-Mb1Zrv9LHdmSwNt6vIxX1DNhH6Ow3hcFPXER92f4AAq3kfeUuq82SRCs8E3N0YAVBHZdv7ZGbWTwaNsarDU9gdn2IpA9cfXJgw'
      },
      {
        id: 'friday-bbq',
        cost: 'Shared grocery cost',
        title: 'BBQ / burgers',
        description: 'Sausages, steaks, reliable. Nobody has to learn anything new.',
        meta: ['Friday evening', 'Shared grocery cost'],
        vibe: 'Safe bet'
      },
      {
        id: 'friday-grazing',
        cost: 'Shared grocery cost',
        title: 'Grazing table and snacks',
        description: 'Low effort, high reward. Cheese, dips, cured meats, and zero cooking required.',
        meta: ['Friday evening', 'Shared grocery cost'],
        vibe: 'Minimal effort'
      },
      {
        id: 'friday-takeaway',
        cost: 'Pay individually',
        title: 'Takeaway / frozen backup',
        description: 'For when ambition dies on the drive up. No shame, just convenience.',
        meta: ['Friday evening', 'Pay individually'],
        vibe: 'Recovery mode'
      }
    ]
  },
  {
    key: 'saturdayMorning',
    day: 'Saturday',
    title: 'Saturday morning',
    subtitle: 'Controlled Chaos',
    icon: 'wb_sunny',
    options: [
      {
        id: 'sat-morning-clay-public',
        cost: '~$80.50 pp',
        title: 'Clay shooting (public session)',
        description:
          'Melbourne Gun Club, Yering. Zero alcohol beforehand. Photo ID required. Closed shoes. No camo or singlets. Fun option, cursed start time.',
        meta: ['Arrive 8:45am', '1-1.5 hrs', 'Approx. $80.50 pp'],
        vibe: 'Early but worth it',
        link: 'https://www.melbournegunclub.com/come-and-try/',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBN1zmxIa2-q4tW-XEuA-xtRA-31WJ_OdR00pgLEyQlNMD82gdI80E01MvXiq-Uhl3N2Zb7T6JiTxFrn9HxeFO6wdTO3xJFUeWmqcfD4W9CiflxixaRNu7c-KUe_Bgnmf5t6XQZMw6mHlRhVWjeanMk-Ji1CJHbgy_vt4-cTt798X495_60OVclDXqjxu1mOKkCvd7xAJP-zSVHwCo8MU0V8Q7efpFOUVsVOvqTd77hGqMbW4PiPJlSjKbjVz_JAq7cMHHfif4jvfQ'
      },
      {
        id: 'sat-morning-clay-private',
        cost: '~$165 pp',
        title: 'Clay shooting (private session)',
        description: 'Same venue, but booked just for us. Time is flexible, price is higher, ego damage is the same.',
        meta: ['Time by enquiry', 'Approx. $165 pp'],
        vibe: 'Premium chaos',
        link: 'https://www.melbournegunclub.com/corporate-and-social-events-copy/'
      },
      {
        id: 'sat-morning-paintball',
        cost: '~$55-$155 pp',
        title: 'Paintball',
        description: 'Bruises and brotherhood. Mostly just bruises though.',
        meta: ['9:00am or 1:00pm', 'Approx. $55-$155 pp'],
        vibe: 'Likely to result in a fine',
        link: 'https://paintballgames.com.au/play-now/'
      },
      {
        id: 'sat-morning-minigolf',
        cost: '~$19-$29 pp',
        title: 'Mini golf / driving range',
        description: 'Low intensity, high trash talk potential. Good for easing into the day.',
        meta: ['Open 9am-10pm', 'Approx. $19-$29 mini golf', '$14-$19 range'],
        vibe: 'Casual kings',
        link: 'https://www.maroondahgolfpark.com.au/'
      },
      {
        id: 'sat-morning-chill',
        cost: 'Free-ish',
        title: 'Chill morning at Airbnb',
        description: 'Sleep in, coffee, do nothing productive. Protect the energy for later.',
        meta: ['Flexible', 'Free-ish'],
        vibe: 'Recovery mode'
      },
      {
        id: 'sat-morning-walk',
        cost: 'Free',
        title: 'Short walk / nature reset',
        description: '20 to 60 minutes of pretending to be outdoorsy before the drinking starts.',
        meta: ['20-60 mins', 'Free'],
        vibe: 'Wholesome detour',
        link: 'https://www.visityarravalley.com.au/blog/walks-you-can-do-in-an-hour-in-the-yarra-valley'
      },
      {
        id: 'sat-morning-donna-buang',
        cost: 'Free',
        title: 'Mt Donna Buang / Rainforest Gallery',
        description: 'Elevated walkway through ancient rainforest. Looks incredible in winter. Free and genuinely cool.',
        meta: ['Flexible', 'Free'],
        vibe: 'Nature break',
        link: 'https://www.parks.vic.gov.au/places-to-see/parks/yarra-ranges-national-park'
      },
      {
        id: 'sat-morning-archery',
        cost: '~$45 pp',
        title: 'Archery',
        description: 'Channel your inner medieval energy. Group sessions available by enquiry.',
        meta: ['Time by enquiry', 'From approx. $45 pp'],
        vibe: 'Wildcard',
        link: 'https://yvap.com.au/corporate/'
      }
    ]
  },
  {
    key: 'saturdayLunch',
    day: 'Saturday',
    title: 'Saturday lunch / winery',
    subtitle: 'Long Lunch',
    icon: 'restaurant',
    options: [
      {
        id: 'sat-lunch-yering',
        cost: '~$15-$35 pp tastings',
        title: 'Yering Station',
        description: 'Big vineyard energy, polished long lunch, great Pinot options.',
        meta: ['Approx. $15-$35 pp tastings'],
        vibe: 'Sophisticated sipping',
        link: 'https://www.yering.com/visit-us/cellar-door/',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD6zVl9_IxBAVuPnEMbSeodLMBs-bnqy7DivYP9ssvdSwb944tFWxmbpbi27oe6NQDWtK2-3opyA5SjLETQ1KGXV0VVRkAFbBPh12OakncL62B_n51D1HsiJdY9f7bTdSlX4NpzeBmfjl4BqLxU2sDiKbyQGrjuX85xzr0F4rJJ9y3JdUhREMxR5TA1mYoYvnmfQ7Jo2GvC6bWSgr4Zye84JT6sSc2tOv5eCrdBgoOReoULEnZBQMVIweDjT_5OTPOcaCorxvLQYBw'
      },
      {
        id: 'sat-lunch-rochford',
        cost: '~$15-$25 pp tastings',
        title: 'Rochford Wines',
        description: 'Set menu approach and fewer choices for chaos management.',
        meta: ['Approx. $15-$25 pp tastings'],
        vibe: 'Premium lock-in',
        link: 'https://rochfordwines.com.au/yarra-valley-cellar-door'
      },
      {
        id: 'sat-lunch-chandon',
        cost: '~$22 pp tasting',
        title: 'Chandon',
        description: 'Bubbles and views. Pure sophistication before the night descends into chaos.',
        meta: ['Approx. $22 pp tasting'],
        vibe: 'Bubbly energy',
        link: 'https://www.chandon.com.au/Experiences'
      },
      {
        id: 'sat-lunch-oakridge',
        cost: 'Group pricing on enquiry',
        title: 'Oakridge Wines',
        description: 'Award-winning food, serious cellar door. Good for a group that can behave for 90 minutes.',
        meta: ['Enquire for group pricing'],
        vibe: 'Refined choice',
        link: 'https://oakridgewines.com.au/cellar-door/'
      },
      {
        id: 'sat-lunch-debortoli',
        cost: 'Restaurant pricing',
        title: 'De Bortoli Locale',
        description: 'Restaurant with cheese room. The cheese room alone justifies the trip.',
        meta: ['Restaurant pricing / group enquiry'],
        vibe: 'Cheese believers',
        link: 'https://www.debortoli.com.au/visit-us/restaurants/locale-restaurant-yarra-valley'
      },
      {
        id: 'sat-lunch-hubert',
        cost: 'Restaurant pricing',
        title: 'Hubert Estate / Quarters',
        description: 'Modern and sleek. Good food, good wine, slightly more grown-up energy.',
        meta: ['Restaurant pricing / group enquiry'],
        vibe: 'Grown-up energy',
        link: 'https://hubertestate.com.au/quarters-dining/'
      },
      {
        id: 'sat-lunch-grand-hotel',
        cost: 'Pay individually',
        title: 'Yarra Valley Grand Hotel',
        description: 'Pub classics, less ceremony, easier for all tastes. Pay individually.',
        meta: ['Pay individually'],
        vibe: 'Casual kings',
        link: 'https://yarravalleygrand.com.au/'
      }
    ]
  },
  {
    key: 'saturdayDrinks',
    day: 'Saturday',
    title: 'Saturday afternoon drinks',
    subtitle: 'Gin & Juice',
    icon: 'liquor',
    options: [
      {
        id: 'sat-drinks-four-pillars',
        cost: '~$50 pp',
        title: 'Four Pillars Gin',
        description: 'The legendary Bloody Shiraz gin awaits. Approx 55 min session, hourly from 12pm weekends.',
        meta: ['Approx. 55 mins', 'Approx. $50 pp'],
        vibe: 'Deep vibes only',
        link: 'https://fourpillarsgin.com/pages/visit-our-distillery',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDLLpHdOLMWrQqUL_l-lL6jzKxBmolYD14UoCVc9phlOzNgSuUpjAa2meMacN46VZoS6rW2QCt-yRl31bh_EVoL8DyZ2rtQRn2OQcZyNa-Xp6t_KLroVSa_CpdQZ6CK0MruG-6O1ZiYjxwK_WsmyIe-KQ_oLmUy0GYrXMclewnNTNqPpNbrx57N86oZandc_pTvV5TfP-CeLHA_rdVvSFqm-qsJrxUqI-AnCDyj72DNdZq63FY_LBPozjFmfRr2qQ8ttLCnUB56OZQ'
      },
      {
        id: 'sat-drinks-watts',
        cost: 'Pay as you go',
        title: 'Watts River Brewing',
        description: 'Craft beers, outdoor tables, very acceptable afternoon pivot.',
        meta: ['Flexible', 'Pay as you go'],
        vibe: 'Casual kings',
        link: 'https://wattsriverbrewing.com.au/'
      },
      {
        id: 'sat-drinks-st-ronans',
        cost: 'Pay as you go',
        title: "St Ronan's Cider",
        description: 'Cider and perries for the beer-averse. Relaxed vibe, easy afternoon stop.',
        meta: ['Flexible', 'Pay as you go'],
        vibe: 'Chill option',
        link: 'https://www.visitvictoria.com/regions/yarra-valley-and-dandenong-ranges/eat-and-drink/breweries-and-distilleries/cideries/st-ronans-cider'
      },
      {
        id: 'sat-drinks-more-wineries',
        cost: 'Varies',
        title: 'More winery tastings',
        description: 'Keep the wine train rolling. Hit another cellar door or two before dinner.',
        meta: ['Flexible', 'Varies'],
        vibe: 'Committed to the cause'
      },
      {
        id: 'sat-drinks-airbnb',
        cost: 'Free',
        title: 'Back to Airbnb earlier',
        description: 'Regroup at base camp. Saves money, saves energy, saves face.',
        meta: ['Flexible', 'Free'],
        vibe: 'Recovery mode'
      }
    ]
  },
  {
    key: 'saturdayNight',
    day: 'Saturday',
    title: 'Saturday night',
    subtitle: 'Main Character Dinner',
    icon: 'local_bar',
    options: [
      {
        id: 'sat-night-bbq',
        cost: 'Shared grocery cost',
        title: 'BBQ dinner',
        description: 'Back at base camp. Fire up the barbie, keep it simple, keep it loud.',
        meta: ['Evening', 'Shared grocery cost'],
        vibe: 'Classic'
      },
      {
        id: 'sat-night-pizza',
        cost: 'Shared grocery cost',
        title: 'Pizza oven round two',
        description:
          'Pizza oven round two only works if people help. This is a group weekend, not a one-man restaurant.',
        meta: ['Evening', 'Shared grocery cost'],
        vibe: 'High stakes (again)',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCrH-m34CP_D9VNZKMhnBwjPcte38Qjx4EBE6jckRKWxfxuT6eMdNcgVz_YZV6Ifh2cbqkckhF2nVRmDf1Va0IUjjJs1C4_aYgb79KalscZHwnJG-l53cdeZPyPEtnM7V3B1xF27YtjRJAq8CrLqq3OAaaJrlyvclweDvIbMEYd-Mb1Zrv9LHdmSwNt6vIxX1DNhH6Ow3hcFPXER92f4AAq3kfeUuq82SRCs8E3N0YAVBHZdv7ZGbWTwaNsarDU9gdn2IpA9cfXJgw'
      },
      {
        id: 'sat-night-catered',
        cost: 'Pricing on enquiry',
        title: 'Catered / private chef',
        description: 'Someone else cooks, we just eat. Premium option but zero effort required.',
        meta: ['Evening', 'Enquire for pricing'],
        vibe: 'Premium plan'
      },
      {
        id: 'sat-night-takeaway',
        cost: 'Pay individually',
        title: 'Big takeaway order',
        description: 'Order everything. Eat on the couch. No judgement zone.',
        meta: ['Evening', 'Pay individually'],
        vibe: 'Zero effort'
      },
      {
        id: 'sat-night-pub',
        cost: 'Pay individually',
        title: 'Pub / restaurant dinner',
        description: 'Head out to a venue. More structured, easier for fussy eaters.',
        meta: ['Evening', 'Pay individually'],
        vibe: 'Night out',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDELENszvK8vbg4vXPD_ei24zwcphcQXXc7skWuGTbxPRULixL9cyf3EFQIEQlUGeo5vEd_XlVbUNa6kvKTW9gVRi_xKV2cvt2MHxhqiotv8FHj_ekbFwG9GXfhTdGdO8dIiOxB3c19jbixMZSSCbF4mmXUtBvwCSAQLtxd1OnJKmAjeL6kuBXCyUzlCSoc8JNjGQB2qS6KeeIH3Z6x54w6mO9nqN001OB1GapQe82Cwuhq8hvAPqEW_lmpK6-Mre-ku3J6CvlYT-w'
      }
    ]
  },
  {
    key: 'sundayRecovery',
    day: 'Sunday',
    title: 'Sunday recovery',
    subtitle: 'Soft Landing',
    icon: 'coffee',
    options: [
      {
        id: 'sun-chocolaterie',
        cost: 'Free / ~$4 tasting',
        title: 'Yarra Valley Chocolaterie',
        description: 'Free entry, optional tasting for $4. Sugar fixes everything.',
        meta: ['Usually 9am-5pm', 'Free entry', 'Optional $4 tasting'],
        vibe: 'Sugar hit',
        link: 'https://www.yvci.com.au/'
      },
      {
        id: 'sun-sanctuary',
        cost: '~$54.50 pp',
        title: 'Healesville Sanctuary',
        description: 'Wholesome animal reset before heading home. Platypus viewing is genuinely great.',
        meta: ['Usually 9am-5pm', 'From approx. $54.50 pp'],
        vibe: 'Nature break',
        link: 'https://www.zoo.org.au/healesville/',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD_c1XucOuTnd28YfwCe_ivREUyV5FNlTUVStCcNHhbx7lf6G3j9rUydUkEhRo2MOKhDG_G0ixvcdh0zW4q5Q7Qr9Q8XjrpaD-yIczUr2gOp5HR8BUqAnIJqtNH_ubmI_b-Ok-wDv4Lldiq2Ps-vWIXgs_RbwEEPtoIm-H-raaAMvXPuEcTZR3qwXnShTW8YuqsH8d1U_NeCVD3KBhlIIiwKlZYcC6IK0j7cN9WzY_ltjZUb4anlI2xuWbyl1zMuZBDAptsjdJoC5Y'
      },
      {
        id: 'sun-walk',
        cost: 'Free',
        title: 'Short nature walk',
        description: 'Fresh air, mild exertion, questionable motivation.',
        meta: ['Flexible', 'Free'],
        vibe: 'Wholesome detour'
      },
      {
        id: 'sun-pub-lunch',
        cost: 'Pay individually',
        title: 'Pub / winery lunch',
        description: 'One more meal out before reality returns.',
        meta: ['Flexible', 'Pay individually'],
        vibe: 'Last hurrah'
      },
      {
        id: 'sun-minigolf',
        cost: '~$19-$29 pp',
        title: 'Mini golf / driving range',
        description: 'Low stakes, high trash talk. Good Sunday energy.',
        meta: ['Open 9am-10pm', 'Approx. $19-$29'],
        vibe: 'Casual kings',
        link: 'https://www.maroondahgolfpark.com.au/'
      },
      {
        id: 'sun-leave-early',
        cost: '',
        title: 'Leave early',
        description: 'Skip the fanfare and reclaim Sunday afternoon. No judgement.',
        meta: ['Anytime'],
        vibe: 'Quiet exit'
      }
    ]
  }
];

export const itineraryTimeline = [
  {
    day: 'Friday — Settling In',
    entries: [
      { time: '18:00', title: 'Arrival & Base Camp Check-in', note: 'Airbnb key handoff and room picks.', status: 'confirmed' },
      { time: '20:30', title: 'Group Dinner (TBC)', note: 'Depends on the Friday vote winner.', status: 'tbc' }
    ]
  },
  {
    day: 'Saturday — The Main Event',
    entries: [
      { time: '10:00', title: 'Morning activity block', note: 'Chosen option from voting.', status: 'confirmed' },
      { time: '13:00', title: 'Long lunch / winery', note: 'Group booking after votes lock in.', status: 'confirmed' },
      { time: '19:30', title: 'Saturday night dinner', note: 'Main character energy only.', status: 'tbc' }
    ]
  },
  {
    day: 'Sunday — Recovery',
    entries: [
      { time: '10:30', title: 'Soft landing plan', note: 'Chocolaterie / sanctuary / leave early.', status: 'confirmed' }
    ]
  }
];

export const bookingStatus = [
  { item: 'Airbnb', subtitle: 'Base camp secured', icon: 'house', status: 'Booked' },
  { item: 'Saturday activity', subtitle: 'Pending vote outcome', icon: 'sports_score', status: 'Not booked' },
  { item: 'Saturday lunch', subtitle: 'Winery booking window open', icon: 'restaurant', status: 'Not booked' },
  { item: 'Saturday drinks', subtitle: 'Distillery/brewery slot', icon: 'liquor', status: 'Not booked' }
];

export const essentialsChecklist = [
  'Warm clothes (Valley gets cold)',
  'Phone chargers',
  'Electrolytes',
  'Good vibes only'
];
