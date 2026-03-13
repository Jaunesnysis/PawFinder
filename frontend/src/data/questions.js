export const questions = {
  type: {
    type: 'choice',
    question: 'Kokio tipo augintinio ieškote?',
    options: [
      { label: 'Šuo', value: 'dog' },
      { label: 'Katė', value: 'cat' }
    ]
  },
  dog: [
    {
      type: 'scale',
      question: 'Šėrimasis (Shedding) Kiek toleruojate namuose paliekamus plaukus?',
      options: [
        { label: 'Noriu, kad šuo beveik nemestų kailio (pvz., pudelis).', value: 1 },
        { label: 'Labai mažai.', value: 2 },
        { label: 'Vidutiniškai.', value: 3 },
        { label: 'Gali šertis gausiai.', value: 4 },
        { label: 'Plaukai visame name man visiškai netrukdo.', value: 5 }
      ],
      apiKey: 'shedding'
    },
    {
      type: 'scale',
      question: 'Lojimas (Barking) Koks jūsų požiūris į šuns balsą/triukšmą?',
      options: [
        { label: 'Noriu itin tylaus šuns (pvz., dėl jautrių kaimynų).', value: 1 },
        { label: 'Retas sulojimas.', value: 2 },
        { label: 'Vidutiniškai (loja tik esant reikalui).', value: 3 },
        { label: 'Gana balsingas.', value: 4 },
        { label: 'Mėgstu šunis, kurie drąsiai „kalba“.', value: 5 }
      ],
      apiKey: 'barking'
    },
    {
      type: 'scale',
      question: 'Energija (Energy) Koks jūsų dienos aktyvumas, kuriuo dalinsitės su šunimi?',
      options: [
        { label: 'Labai mažas (ramūs pasivaikščiojimai prie namų).', value: 1 },
        { label: 'Ramus laisvalaikis.', value: 2 },
        { label: 'Vidutinis (30–60 min. aktyvaus judėjimo).', value: 3 },
        { label: 'Aktyvus sportas ir bėgiojimas.', value: 4 },
        { label: 'Itin didelis fizinis krūvis (žygiai, darbas).', value: 5 }
      ],
      apiKey: 'energy'
    },
    {
      type: 'scale',
      question: 'Sargumas (Protectiveness) Ar norite, kad šuo saugotų namus ir reaguotų į svetimus žmones?',
      options: [
        { label: 'Visiems draugiškas, net nepažįstamiems.', value: 1 },
        { label: 'Mažai saugantis.', value: 2 },
        { label: 'Vidutinis budrumas.', value: 3 },
        { label: 'Geras sargas.', value: 4 },
        { label: 'Maksimalus sargumas ir nepasitikėjimas svetimais.', value: 5 }
      ],
      apiKey: 'protectiveness'
    },
    {
      type: 'scale',
      question: 'Dresuojamumas (Trainability) Kiek pastangų planuojate įdėti į dresūrą?',
      options: [
        { label: 'Noriu šuns, kuris turi „savo nuomonę“ ir yra užsispyręs.', value: 1 },
        { label: 'Reikalaujantis daug kantrybės.', value: 2 },
        { label: 'Vidutiniškai lengva dresuoti.', value: 3 },
        { label: 'Gana paklusnus.', value: 4 },
        { label: 'Noriu, kad šuo mokytųsi akimirksniu ir būtų labai paklusnus.', value: 5 }
      ],
      apiKey: 'trainability'
    },
    {
      type: 'choice',
      question: 'Dydis (Mapping to Height/Weight) Kokio dydžio šuo tinka jūsų namams?',
      options: [
        { label: 'Mažas', value: 'small', apiMappings: { max_height: 12, max_weight: 20 } },
        { label: 'Vidutinis', value: 'medium', apiMappings: { max_height: 20, max_weight: 50 } },
        { label: 'Didelis', value: 'large', apiMappings: { min_height: 20, min_weight: 50 } }
      ]
    }
  ],
  cat: [
    {
      type: 'scale',
      question: 'Šėrimasis (Shedding) Kiek laiko norite skirti kailio valymui nuo baldų?',
      options: [
        { label: 'Minimaliai (beveik nesišerianti katė).', value: 1 },
        { label: 'Mažai.', value: 2 },
        { label: 'Vidutiniškai.', value: 3 },
        { label: 'Daug.', value: 4 },
        { label: 'Maksimaliai (ilgaplaukė katė).', value: 5 }
      ],
      apiKey: 'shedding'
    },
    {
      type: 'scale',
      question: 'Draugiškumas šeimai (Family Friendly) Ar norite meilios katės, kuri nuolat ieško žmogaus draugijos?',
      options: [
        { label: 'Labai nepriklausoma (ateina retai).', value: 1 },
        { label: 'Mažiau meili.', value: 2 },
        { label: 'Vidutiniškai bendraujanti.', value: 3 },
        { label: 'Labai meili ir švelni.', value: 4 },
        { label: '„Katė-klijai“ (nuolat kartu).', value: 5 }
      ],
      apiKey: 'family_friendly'
    },
    {
      type: 'scale',
      question: 'Žaismingumas (Playfulness) Ar norite aktyvios katės, kuri nuolat žaidžia ir dūksta?',
      options: [
        { label: 'Labai rami, sėsli.', value: 1 },
        { label: 'Retai žaidžianti.', value: 2 },
        { label: 'Vidutinio aktyvumo.', value: 3 },
        { label: 'Labai žaisminga.', value: 4 },
        { label: 'Nuolat ieškanti nuotykių ir energijos užtaisas.', value: 5 }
      ],
      apiKey: 'playfulness'
    },
    {
      type: 'scale',
      question: 'Priežiūra/Grooming (Dėmesio: API vertina atvirkščiai) Kiek laiko skirsite katės šukavimui?',
      options: [
        { label: 'Galiu šukuoti kasdien.', value: 1 },
        { label: 'Kelis kartus per savaitę.', value: 2 },
        { label: 'Vidutiniškai.', value: 3 },
        { label: 'Kartais.', value: 4 },
        { label: 'Noriu katės, kuriai nereikia jokios kailio priežiūros.', value: 5 }
      ],
      apiKey: 'grooming'
    },
    {
      type: 'scale',
      question: 'Draugiškumas kitiems gyvūnams (Other Pets Friendly) Ar namuose turite kitų augintinių (šunų, kitų kačių)?',
      options: [
        { label: 'Neturiu ir neplanuoju.', value: 1 },
        { label: 'Reikės laiko priprasti.', value: 2 },
        { label: 'Vidutiniškai tolerantiška.', value: 3 },
        { label: 'Labai draugiška kitiems.', value: 4 },
        { label: 'Idealiai sugyvena su visais.', value: 5 }
      ],
      apiKey: 'other_pets_friendly'
    },
    {
      type: 'scale',
      question: 'Draugiškumas vaikams (Children Friendly) Ar jūsų namuose yra (ar bus) mažų vaikų?',
      options: [
        { label: 'Vaikų nėra.', value: 1 },
        { label: 'Geriau ramybė be vaikų.', value: 2 },
        { label: 'Vidutinis tolerantiškumas.', value: 3 },
        { label: 'Mėgsta vaikus.', value: 4 },
        { label: 'Idealiai tinka šeimoms su mažais vaikais.', value: 5 }
      ],
      apiKey: 'children_friendly'
    }
  ]
};