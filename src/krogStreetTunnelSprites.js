// Pixel-art pieces for the Krog Street Tunnel, where Krog Street runs under the
// railroad and every surface is painted.
//
// The map is top-down and characters always draw over it, so the tunnel can't have a
// roof the player walks under. Instead:
//   - KROG_TUNNEL_PORTAL is the entrance seen from the street: the railroad bridge on
//     top, a painted concrete face and a dark mouth with a lit far end. Draw one at each
//     end of the tunnel path, centred on the road and turned so the mouth faces out
//     along the street (the far end turned half a circle). Its bottom edge is open, so
//     the road runs straight into the mouth.
//   - KROG_TUNNEL_WALL is a strip of painted wall that tiles sideways. Repeat it along
//     both edges of the tunnel path, turned to follow the road, in place of the plain
//     brick edge.
// Each character is one pixel; see KROG_TUNNEL_PALETTE.
export const KROG_TUNNEL_PORTAL_ROWS = [
  '.o...o...o...o...o...o...o...o...o...o...o...o...o....',
  'okoookoookoookoookoookoookoookoookoookoookoookoookooo.',
  'okkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkko',
  'okoookoookoookoookoookoookoookoookoookoookoookoookooo.',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oGrGGrGGrGGrGGrGGrGGrGGrGGrGGrGGrGGrGGrGGrGGrGGrGGrGGo',
  'oGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGo',
  'oHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHo',
  'oceccppppppppppcyyyyyyyyiiycccaaaaaaaaiiiccccceeecpcco',
  'oeeeppppppppppppcyyyyyyiyyccckkaaaaaaiaacicccceeepppco',
  'oeeepppppppppooooooooooooooooooooooooooooyieceeiepppco',
  'oeeeeepppppppoNNNNNNNNNNNNNNNNNNNNNNNNNNoeeeeepeippppo',
  'oeeieeepppppcopNNNNNNNNNNNNNNNNNNNNNNNNuoeeppppppippco',
  'oeeeiiiepeeeeokeNNNNNNNNNNNNNNNNNNNNNNpuoeppppppppipio',
  'oeeepypppepppopkyNNNNNNNNNLLNNNNNNNNNapuoppppppppppieo',
  'oeeyyyyyppppeopekuNNNNNNNNNNNNNNNNNNeapkopppppppppeeeo',
  'oeeepypppppccopeykpNNNNNNNNNNNNNNNNyeakuoppeeeepppeeko',
  'oeeecccpcccccopeyukaNNNNNNNNNNNNNNpyekpuoppekkepppekeo',
  'oeckckcccccccokeyupkeNNNNNNNNNNNNepykapuoppekkepppeeeo',
  'occckckccccccopkyupakyNLNNNNNNLNyepkeapuoppeeeepppeeao',
  'occcccckcccccopekupaekNNNNNNNNNNyekyeapkopppppppppaaao',
  'occccccccccccopeykpaeyNNLLLLLLNNykpyeakuopppppppppaaao',
  'occycccccccaaopeyukaeyNNLllllLNNkepyekpuopppppppppaaao',
  'oyyyyyccccaaaokeyupkeyNNLllllLNNyepykapuopppppppppaaao',
  'occycccccccipopkyupakyNNLllllLNNyepkeapuokcckcccaaaaao',
  'occccccccccciopekupaekNNLllllLNNyekyeapkocpppppaaaacao',
  'occcccccccccpopeykpaeyNNLLLLLLNNykpyeakuopppppppaaaaco',
  'occccccccccppopeyukaeyNNNNNNNNNNkepyekpuoppppppppaauao',
  'occccccpccccpokeyupkeyNNNNNNNNNNyepykapuopppppppuuuuuo',
  'occccpppppccuopkyupakyNNNNNNNNNNyepkeapuocpppppuuuuuuo',
  'occccpppppuuuopekupaekNNNNNNNNNNyekyeapkoiicpcuuuuuuuo',
  'occcpppppuuuuopeykpaeyNNNNNNNNNNykpyeakuoucccyyukkuuuo',
];

export const KROG_TUNNEL_WALL_ROWS = [
  'oooooooooooooooooooooooooooooooo',
  'ceeeeeeeccceeeeieieiepppkkppkeke',
  'eeeeeeeeeccceeeeeeeepppkpppkpkeu',
  'ueeeeeeeuyyyyeeeeeeeppkpppkpccuu',
  'uuuueuuuycccccyyeppuukuuppcccccu',
  'uyyukppppciiiyiiyyuuuuuuuaaicccc',
  'uukkykpciiccciyyyuyuuuuuuuiciccu',
  'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
];

export const KROG_TUNNEL_PALETTE = {
  o: '#2a1d17', // outline
  k: '#1c1a22', // fence rail and black tags
  G: '#4b5563', // steel bridge girder
  H: '#353c47', // girder shadow
  r: '#8a939e', // rivets
  c: '#8d8a86', // bare concrete
  C: '#6b6864', // concrete shadow
  p: '#ff5c8a', // pink paint
  e: '#28d7c0', // teal paint
  y: '#ffd45c', // yellow paint
  u: '#9f7aea', // purple paint
  a: '#ff9a3c', // orange paint
  i: '#f4f1ea', // white tags
  n: '#1b2230', // dark inside the tunnel
  N: '#2f3f52', // tunnel road and ceiling, further in
  L: '#ffd45c', // ceiling lights and far-end glow
  l: '#fff1a8', // bright daylight at the far end
};

function paintRows(rows) {
  const sprite = document.createElement('canvas');
  sprite.width = rows[0].length;
  sprite.height = rows.length;
  const spriteContext = sprite.getContext('2d');

  rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = KROG_TUNNEL_PALETTE[pixel];
      if (!color) return;
      spriteContext.fillStyle = color;
      spriteContext.fillRect(x, y, 1, 1);
    });
  });

  return sprite;
}

export function createKrogTunnelPortalSprite() {
  return paintRows(KROG_TUNNEL_PORTAL_ROWS);
}

export function createKrogTunnelWallSprite() {
  return paintRows(KROG_TUNNEL_WALL_ROWS);
}
