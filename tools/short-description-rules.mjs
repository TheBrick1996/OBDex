// Conservative fleet terminology. Never truncate a title to meet a word limit.
export function proposeShortDescription(title) {
  let text = title;
  const substitutions = [
    [/\bDiesel Particulate Filter\b/gi, 'DPF'],
    [/\bExhaust Gas Recirculation\b/gi, 'EGR'],
    [/\bReductant\b/gi, 'DEF'],
    [/\bTurbocharger\/Supercharger\b/gi, 'Turbo/Supercharger'],
    [/\bTurbocharger\b/gi, 'Turbo'],
    [/\bRequested MIL Illumination\b/gi, 'Requested Check Engine Light'],
    [/\bMalfunction Indicator Lamp\b/gi, 'Check Engine Light'],
    [/\bTemperature\b/gi, 'Temp'],
    [/^System Too Rich\b/i, 'Rich Fuel Mixture'],
    [/^System Too Lean\b/i, 'Lean Fuel Mixture'],
    [/\bFlow Insufficient Detected\b/gi, 'Flow Insufficient'],
  ];
  for (const [pattern, replacement] of substitutions) text = text.replace(pattern, replacement);
  // Preserve the component and all bank/sensor qualifiers after "Threshold".
  text = text.replace(/^(.+?) Efficiency Below Threshold(.*)$/i, 'Low $1 Efficiency$2');
  text = text.replace(/\s+/g, ' ').trim();
  return text !== title && text.split(/\s+/).length < 10 ? text : null;
}
