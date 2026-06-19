"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { archiveNewProject, controlErrorMessage, saveNewProject, setNewProjectStatus, type ControlNewProject, type NewProjectPayload, type NewProjectStatus } from '@/lib/control-api'

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function nullableText(formData: FormData, key: string) {
  return text(formData, key) || null
}

function nullableNumber(formData: FormData, key: string) {
  const value = text(formData, key)
  if (!value) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function images(formData: FormData) {
  return text(formData, 'images')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function status(formData: FormData): NewProjectStatus {
  const value = text(formData, 'status')
  return value === 'published' || value === 'archived' ? value : 'draft'
}

function payloadFromFormData(formData: FormData): NewProjectPayload {
  return {
    id: nullableText(formData, 'id') || undefined,
    projectName: text(formData, 'projectName'),
    developerName: nullableText(formData, 'developerName'),
    startPrice: nullableNumber(formData, 'startPrice'),
    endPrice: nullableNumber(formData, 'endPrice'),
    images: images(formData),
    video: nullableText(formData, 'video'),
    description: text(formData, 'description'),
    mapLocation: nullableText(formData, 'mapLocation'),
    phone: nullableText(formData, 'phone'),
    address: nullableText(formData, 'address'),
    cityId: nullableText(formData, 'cityId'),
    countryId: nullableText(formData, 'countryId'),
    status: status(formData)
  }
}

function errorRedirect(path: string, error: unknown): never {
  redirect(`${path}?error=${encodeURIComponent(controlErrorMessage(error, 'Could not save project.'))}`)
}

export async function createNewProjectAction(formData: FormData) {
  let project: ControlNewProject
  try {
    project = await saveNewProject(payloadFromFormData(formData))
  } catch (error) {
    errorRedirect('/new-projects/new', error)
  }
  revalidatePath('/new-projects')
  redirect(`/new-projects/${encodeURIComponent(project.id)}`)
}

export async function updateNewProjectAction(formData: FormData) {
  const id = text(formData, 'id')
  let project: ControlNewProject
  try {
    project = await saveNewProject(payloadFromFormData(formData))
  } catch (error) {
    errorRedirect(`/new-projects/${encodeURIComponent(id)}/edit`, error)
  }
  revalidatePath('/new-projects')
  redirect(`/new-projects/${encodeURIComponent(project.id)}`)
}

export async function setNewProjectStatusAction(formData: FormData) {
  const id = text(formData, 'id')
  try {
    await setNewProjectStatus(id, status(formData))
  } catch (error) {
    errorRedirect(`/new-projects/${encodeURIComponent(id)}`, error)
  }
  revalidatePath('/new-projects')
  redirect(`/new-projects/${encodeURIComponent(id)}`)
}

export async function archiveNewProjectAction(formData: FormData) {
  const id = text(formData, 'id')
  try {
    await archiveNewProject(id)
  } catch (error) {
    errorRedirect(`/new-projects/${encodeURIComponent(id)}`, error)
  }
  revalidatePath('/new-projects')
  redirect('/new-projects')
}
