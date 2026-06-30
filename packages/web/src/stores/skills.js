import { defineStore } from 'pinia'

export const useSkillsStore = defineStore('skills', {
  state: () => ({
    skills: [],
    loading: false,
    error: null
  }),
  
  getters: {
    allSkills: (state) => state.skills,
    skillCount: (state) => state.skills.length,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error
  },
  
  actions: {
    setSkills(skills) {
      this.skills = skills
    },
    
    setLoading(loading) {
      this.loading = loading
    },
    
    setError(error) {
      this.error = error
    }
  }
})
