import bellySignImageUrl from './images/belly.png'
import wantedImageUrl from './images/one-piece-wanted.png'
import { WantedImageInfo } from './types'

export const ONE_PIECE_WANTED_IMAGE: WantedImageInfo = {
  imageUrl: wantedImageUrl,
  bellyImageUrl: bellySignImageUrl,
  photoPosition: { x: 74, y: 252, width: 638, height: 484 },
  namePosition: { x: 87, y: 826, width: 586, height: 114 },
  guildNamePosition: { x: 248, y: 1063, width: 586, height: 40 },
  deadOrAlivePosition: { x: 87, y: 755, width: 586, height: 50 },
  descriptionPosition1: { x: 80, y: 1050, width: 260, height: 20 },
  descriptionPosition2: { x: 80, y: 1070, width: 260, height: 20 },
  descriptionPosition3: { x: 80, y: 1090, width: 260, height: 20 },
  titlePosition: { x: 75, y: 55, width: 638, height: 165 },
  bountyInfo: {
    x: 120,
    y: 980,
    width: 592,
    height: 45,
    bellyMarginRight: 18,
    fontSize: 52.5
  },
  boundaryOffset: {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
  }
}
