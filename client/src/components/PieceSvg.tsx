import player1Sprite from "../sprites/player_1_sprite.png";
import player1PromotedSprite from "../sprites/player_1_sprite_promoted.png";
import player2Sprite from "../sprites/player_2_sprite.png";
import player2PromotedSprite from "../sprites/player_2_sprite_promoted.png";
import player3Sprite from "../sprites/player_3_sprite.png";
import player3PromotedSprite from "../sprites/player_3_sprite_promoted.png";
import player4Sprite from "../sprites/player_4_sprite.png";
import player4PromotedSprite from "../sprites/player_4_sprite_promoted.png";

const getPieceSprite = (playerNumber: number, isKing: boolean): string => {
  switch (playerNumber) {
    case 1:
      return isKing ? player1PromotedSprite : player1Sprite;
    case 2:
      return isKing ? player2PromotedSprite : player2Sprite;
    case 3:
      return isKing ? player3PromotedSprite : player3Sprite;
    case 4:
      return isKing ? player4PromotedSprite : player4Sprite;
    default:
      return isKing ? player1PromotedSprite : player1Sprite;
  }
};

const PieceSvg = ({
  playerNumber,
  isKing,
  className = "",
}: {
  playerNumber: number;
  isKing: boolean;
  className?: string;
}) => {
  const sprite = getPieceSprite(playerNumber, isKing);

  return (
    <img
      src={sprite}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`block select-none object-contain ${className}`}
    />
  );
};

export default PieceSvg;
