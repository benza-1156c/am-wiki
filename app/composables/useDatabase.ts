export function useDatabase() {
  const { data: dbData, pending: dbPending, error: dbError, refresh } = useFetch<any>('/api/database', {
    key: 'am-db-data',
    default: () => null
  })

  const units = computed<any[]>(() => dbData.value?.units || [])
  const skills = computed<Record<string, any>>(() => dbData.value?.skills || {})
  const traits = computed<Record<string, any>>(() => dbData.value?.traits || {})

  function handleUnitsUpdated(newUnits: any[]) {
    if (dbData.value) {
      dbData.value.units = newUnits
      if (dbData.value.meta) {
        dbData.value.meta.totalUnits = newUnits.length
      }
    }
  }

  return {
    dbData,
    dbPending,
    dbError,
    refresh,
    units,
    skills,
    traits,
    handleUnitsUpdated
  }
}
