export const SUBSECTIONS = {
  ri0:  '1A — General Roof',
  ri6:  '1B — Ventilation',
  ri11: '1C — Pipe Jacks & Exhaust',
  ri13: '1D — Kickouts',
  ri14: '1E — Skylights & Flashings',
  ri22: '1F — Low Slope & Other Structures',
}

export const ROOF_ITEMS = [
  {
    id: 'ri0', lbl: 'Shingle Style / Grade', flags: ['P'],
    fields: [
      { t: 'multiRadio', l: 'Style', o: ['3-Tab', 'Architectural', 'Designer', 'Disco', 'Impact Resistant'] },
      { t: 'num', l: 'Stories' },
      { t: 'num', l: 'Layers' },
      { t: 'txt', l: 'Predominant Pitch', p: '4/12' },
    ],
  },
  {
    id: 'ri1', lbl: 'Edge Flashings', flags: ['P'],
    fields: [
      { t: 'radio', l: 'Type', o: ['Drip Edge', 'Critter Guard'] },
      { t: 'radio', l: 'Material', o: ['Galvanized', 'Aluminum'] },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri2', lbl: 'Underlayment', flags: ['P'],
    fields: [
      { t: 'yn', l: 'Present' },
      { t: 'radio', l: 'Grade', o: ['Synthetic', 'Felt', 'Unknown'] },
      { t: 'num', l: 'Layers' },
    ],
  },
  {
    id: 'ri3', lbl: 'Ridge Cap', flags: ['P', 'M'],
    fields: [
      { t: 'radio', l: 'Grade', o: ['3-Tab', 'H&R', 'Hi Profile'] },
      { t: 'num', l: 'Exposure (inches)' },
    ],
  },
  {
    id: 'ri4', lbl: 'Starter Shingle', flags: ['P'],
    fields: [
      { t: 'yn', l: 'Present' },
      { t: 'radio', l: 'Style', o: ['Starter Strip', '3-Tab'] },
    ],
  },
  {
    id: 'ri5', lbl: 'Valley', flags: ['P'],
    fields: [
      { t: 'yn', l: 'Present' },
      { t: 'radio', l: 'Style', o: ['Ice & Water', 'W-Valley', 'Valley Metal'] },
    ],
  },
  {
    id: 'ri6', lbl: 'Ridge Vent', flags: ['P', 'M'],
    fields: [
      { t: 'num', l: 'Length (LF)' },
      { t: 'radio', l: 'Type', o: ['Metal', 'Shingle Over'] },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri7', lbl: 'Box Vents', flags: ['P', 'M'],
    fields: [
      { t: 'num', l: 'Qty' },
      { t: 'radio', l: 'Material', o: ['Metal', 'Plastic', 'Wood'] },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri8', lbl: 'Turbines', flags: ['P', 'M'],
    fields: [
      { t: 'num', l: 'Qty' },
      { t: 'radio', l: 'Material', o: ['Metal', 'Plastic'] },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri9', lbl: 'Power Vents', flags: ['P', 'M'],
    fields: [
      { t: 'num', l: 'Qty' },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri10', lbl: 'Solar Vents', flags: ['P', 'M'],
    fields: [
      { t: 'num', l: 'Qty' },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri11', lbl: 'Pipe Jacks', flags: ['P', 'M'],
    fields: [
      { t: 'radio', l: 'Type', o: ['3-in-1/Neoprene', 'Lead', 'Lifetime/Silicone'] },
      { t: 'num', l: 'Qty 1.5"' },
      { t: 'num', l: 'Qty 2"' },
      { t: 'num', l: 'Qty 3"' },
      { t: 'num', l: 'Qty 4"' },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri12', lbl: 'Exhaust Stacks', flags: ['P', 'M', 'D'],
    addMore: true, addMoreLabel: 'Add Stack Size',
    fields: [
      { t: 'multi', l: 'Damage To', o: ['Flange', 'Stack', 'Cap'] },
      { t: 'yn', l: 'Painted' },
    ],
    subFields: [
      { t: 'txt', l: 'Width (inches)', p: 'e.g. 5"' },
      { t: 'num', l: 'Qty' },
    ],
  },
  {
    id: 'ri13', lbl: 'Kickouts', flags: ['P'],
    fields: [
      { t: 'radio', l: 'Present', o: ['Yes', 'No'] },
      { t: 'radio', l: 'Needed', o: ['Yes', 'No'] },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri14', lbl: 'Skylights', flags: ['P', 'M', 'D'],
    addMore: true, addMoreLabel: 'Add Skylight',
    fields: [
      { t: 'radio', l: 'Style', o: ['Fixed', 'Venting', 'Tubular'] },
      { t: 'radio', l: 'Mount', o: ['Flush Mount', 'Curb Mount'] },
      { t: 'yn', l: 'Damaged' },
    ],
    subFields: [
      { t: 'txt', l: 'Size (L x W)', p: 'e.g. 24"x36"' },
      { t: 'yn', l: 'Damaged' },
    ],
  },
  {
    id: 'ri15', lbl: 'Rain Diverter', flags: ['P', 'M'],
    fields: [
      { t: 'num', l: 'Qty' },
      { t: 'num', l: 'LF' },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri16', lbl: 'Power Meter Mast', flags: ['P'],
    fields: [
      { t: 'num', l: 'Qty' },
    ],
  },
  {
    id: 'ri17', lbl: 'Chimney Flashing', flags: ['P', 'M', 'D'],
    addMore: true, addMoreLabel: 'Add Chimney',
    fields: [
      { t: 'select', l: 'Size / Width', o: ['Select...', 'Small (width < 24")', 'Medium (width 24"–36")', 'Large (width > 36")'] },
      { t: 'num', l: 'Qty' },
      { t: 'yn', l: 'Cricket Present' },
      { t: 'yn', l: 'Painted' },
      { t: 'radio', l: 'Counter Flashing', o: ['Replace', 'Reuse'] },
      { t: 'textarea', l: 'Chimney Condition / Leak Hazard Notes', p: 'Describe chimney condition, flashing condition, active or potential leak hazard...' },
    ],
    subFields: [],
  },
  {
    id: 'ri18', lbl: 'Step Flashing', flags: ['P', 'D'],
    fields: [
      { t: 'yn', l: 'Present' },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri19', lbl: 'Counter Flashing', flags: ['P', 'D'],
    fields: [
      { t: 'yn', l: 'Present' },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri20', lbl: 'L Flashing', flags: ['P', 'D'],
    fields: [
      { t: 'yn', l: 'Present' },
      { t: 'yn', l: 'Painted' },
    ],
  },
  {
    id: 'ri21', lbl: 'Cornice Gables', flags: ['P', 'M'],
    fields: [
      { t: 'radio', l: 'Type', o: ['Shingles', 'Metal'] },
      { t: 'num', l: 'Qty' },
      { t: 'txt', l: 'Story', p: '1' },
    ],
  },
  {
    id: 'ri22', lbl: 'Low Slope (Porch / Flat)', flags: ['P', 'D'],
    fields: [
      { t: 'radio', l: 'Location', o: ['Front Porch', 'Back Porch', 'Other'] },
      { t: 'txt', l: 'Style / Grade', p: 'e.g. TPO, Mod.Bitumen, EPDM' },
      { t: 'txt', l: 'Pitch', p: 'e.g. 1/12' },
      { t: 'yn', l: 'Damaged' },
      { t: 'radio', l: 'Exposed Rafters', o: ['Yes', 'No'] },
    ],
  },
  {
    id: 'ri23', lbl: 'Other Structures', flags: ['P', 'D'],
    fields: [
      { t: 'txt', l: 'Type', p: 'Detached garage / shed' },
      { t: 'txt', l: 'Style / Grade', p: '' },
      { t: 'txt', l: 'Pitch', p: '' },
      { t: 'yn', l: 'Damaged' },
    ],
  },
]
