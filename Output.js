const modifier = (text) => {
  text = AutoCards("output", onOutput_SAE(text));
  const p = state.UniversalRPG?.player;
  if (p?.health < 30) text += `\n(The world darkens... your pulse falters. 💔)`;
  return { text };
};
modifier(text);
