import { createContext } from 'react'

// How match lists render:
//   dense       compact rows instead of cards (desktop side column)
//   selectedId  match highlighted as open
//   showLeague  name the competition on every card (a list mixing several leagues)
//   showDay     put the kickoff day on the card (a list not grouped by day)
//   noRank      skip the league-position chips, and with them the /standings request behind them
export const ListContext = createContext({
  dense: false,
  selectedId: null,
  showLeague: false,
  showDay: false,
  noRank: false,
})
