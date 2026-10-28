import units from '../../public/units.json'
import skills from '../../public/skills.json'
import gears from '../../public/gears.json'
import traits from '../../public/traits.json'

export default defineEventHandler(() => {
  return {
    meta: {
      totalUnits: units.length,
      totalGears: gears.length,
      totalTraits: traits.length,
      version: '1.0.0'
    },
    units,
    skills,
    gears,
    traits
  }
})
