/**
 * API 客户端模块
 * 用于与后端通信
 */

const API_BASE = '/api'

export async function fetchSkills() {
  try {
    const response = await fetch(`${API_BASE}/skills`)
    if (!response.ok) throw new Error('Failed to fetch skills')
    return await response.json()
  } catch (error) {
    console.error('Error fetching skills:', error)
    throw error
  }
}

export async function getSkillDetail(id) {
  try {
    const response = await fetch(`${API_BASE}/skills/${id}`)
    if (!response.ok) throw new Error('Failed to fetch skill detail')
    return await response.json()
  } catch (error) {
    console.error('Error fetching skill detail:', error)
    throw error
  }
}

export async function createSkill(data) {
  try {
    const response = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create skill')
    return await response.json()
  } catch (error) {
    console.error('Error creating skill:', error)
    throw error
  }
}

export async function updateSkill(id, data) {
  try {
    const response = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update skill')
    return await response.json()
  } catch (error) {
    console.error('Error updating skill:', error)
    throw error
  }
}

export async function deleteSkill(id) {
  try {
    const response = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete skill')
    return await response.json()
  } catch (error) {
    console.error('Error deleting skill:', error)
    throw error
  }
}
