'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/shared/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Copy, Eye, EyeOff, Trash2, Plus, Key } from 'lucide-react'
import { ACCESS_TOKEN_KEY } from '../../../constants/index'
import { BASE_API_URL } from '../../../constants/env-vars'
import { isAxiosError } from 'axios'
import DeleteConfirmationModal from '@/components/ui/delete-confirm'

interface ApiKey {
  id: string
  name: string
  api_key: string
  created: string
  lastUsed: string | null
  revoked: boolean
  key_type: string
}

type Environment = 'test' | 'production'

export default function ApiKeys() {
  const [loading, setLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [environment, setEnvironment] = useState<Environment>('production')
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<ApiKey | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [apiKeyToDelete, setApiKeyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    const token =
      typeof window !== 'undefined' && localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const headers = buildHeaders()
        const res = await fetch(`${BASE_API_URL}/keys/`, {
          method: 'POST',
          headers,
        })

        let payload
        try {
          payload = await res.json()
        } catch {
          payload = await res.text()
        }

        let list = []
        if (Array.isArray(payload)) {
          list = payload
        } else if (payload.data && Array.isArray(payload.data)) {
          list = payload.data
        } else if (payload.keys && Array.isArray(payload.keys)) {
          list = payload.keys
        } else {
          list = []
        }

        const mapped: ApiKey[] = list.map(
          (raw: {
            id: string
            name: string
            plain_api_key: string
            created: string
            lastUsed: string
            revoked: string
            key_type: string
          }) => ({
            id: raw.id,
            name: raw.name,
            api_key: raw.plain_api_key,
            created: raw.created,
            lastUsed: raw.lastUsed ?? null,
            revoked: raw.revoked ?? false,
            key_type: raw.key_type ?? '',
          })
        )

        setApiKeys(mapped)
      } catch (err) {
        console.error('Error fetching API keys:', err)
        toast('Error', { description: 'Failed to load API keys' })
        setApiKeys([])
      } finally {
        setLoading(false)
      }
    }

    fetchApiKeys()
  }, [])

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast('Error', { description: 'Please enter a name for your API key' })
      return
    }

    setIsGenerating(true)
    setGeneratedKey(null)

    try {
      const headers = buildHeaders()
      const res = await fetch(`${BASE_API_URL}/keys/generate/${environment}/`, {
        method: 'POST',
        headers,
        // 🔑 Here we send `key_name` instead of `name`
        body: JSON.stringify({ key_name: newKeyName.trim() }),
      })

      let payload
      try {
        payload = await res.json()
      } catch {
        payload = await res.text()
      }

      if (!res.ok || !payload.success) {
        throw new Error(payload.error || `Server responded with ${res.status}`)
      }

      const data = payload.data
      const keyObj: ApiKey = {
        id: data.id,
        name: data.name,
        api_key: data.api_key,
        created: data.created,
        lastUsed: data.lastUsed ?? null,
        revoked: data.revoked ?? false,
        key_type: data.key_type ?? '',
      }

      setGeneratedKey(keyObj)
      setApiKeys((prev) => [keyObj, ...prev])
      setNewKeyName('')
      toast('API Key Generated', { description: 'Key created successfully' })
    } catch (err) {
      console.error('Generate API key error:', err)
      if (isAxiosError(err))
        toast('Error', {
          description: err.message || 'Failed to generate API key',
        })
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      setIsDeleting(true)
      const headers = buildHeaders()
      const res = await fetch(`${BASE_API_URL}/keys/delete/${keyId}`, {
        method: 'DELETE',
        headers,
      })

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`)
      }

      setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
      toast('API Key Deleted', {
        description: 'The API key has been permanently deleted.',
      })
    } catch (err) {
      console.error('Delete API key error:', err)
      if (isAxiosError(err))
        toast('Error', {
          description: err.message || 'Failed to delete API key',
        })
    } finally {
      setIsDeleting(false)
    }
  }

  const revokeApiKey = async (keyId: string) => {
    try {
      const headers = buildHeaders()
      const res = await fetch(`${BASE_API_URL}/keys/roll/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ key_id: keyId }),
      })

      if (!res.ok) throw new Error(`Server responded with ${res.status}`)

      setApiKeys((prev) =>
        prev.map((key) => (key.id === keyId ? { ...key, revoked: true } : key))
      )

      toast('API Key Revoked', {
        description: 'The API key has been revoked successfully',
      })
    } catch (err) {
      console.error('Revoke API key error:', err)
      toast('Error', { description: 'Failed to revoke API key' })
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const copyToClipboard = (key: string) => {
    navigator.clipboard
      .writeText(key)
      .then(() =>
        toast('Copied', { description: 'API key copied to clipboard' })
      )
      .catch(() => toast('Error', { description: 'Failed to copy API key' }))
  }

  const maskApiKey = (key: string | undefined) => {
    if (!key) return ''
    if (key.length <= 20) return key
    return key.substring(0, 12) + '...' + key.substring(key.length - 8)
  }

  return (
    <DashboardLayout title="API Keys">
      <Alert className="mb-8 border-white/10 bg-white/5">
        <Key className="h-4 w-4" />
        <AlertDescription className="text-white/70">
          API keys allow you to authenticate requests to Label X services. Keep
          your keys secure and never share them publicly.
        </AlertDescription>
      </Alert>

      {/* Generate New API Key */}
      <Card className="mb-8 border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Generate New API Key
        </h2>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="keyName" className="text-white/80">
                Key Name
              </Label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API, Development API"
                className="mt-1 border-white/10 bg-white/5 text-white"
              />
            </div>

            <div>
              <Label htmlFor="environment" className="text-white/80">
                Environment
              </Label>
              <select
                id="environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as Environment)}
                className="mt-1 rounded border border-white/10 bg-gray-800 p-2 text-white"
              >
                <option value="test" className="bg-gray-800 text-white">Test</option>
                <option value="production" className="bg-gray-800 text-white">Production</option>
              </select>

            </div>
          </div>

          <div className="flex items-end">
            <Button
              onClick={generateApiKey}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Key
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Display Generated Key */}
      {/* {generatedKey && (
        <Card className="mb-8 border-white/10 bg-white/5">
          <div className="border-b border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white">
              Newly Generated Key
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Below is the response for the generated API key.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/80">Name</TableHead>
                <TableHead className="text-white/80">API Key</TableHead>
                <TableHead className="text-white/80">Created</TableHead>
                <TableHead className="text-white/80">Last Used</TableHead>
                <TableHead className="text-white/80">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell className="font-medium text-white">
                  {generatedKey.name}
                </TableCell>

                <TableCell className="font-mono text-sm text-white/80">
                  <div className="flex items-center space-x-2">
                    <span>{generatedKey.api_key}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedKey.api_key)}
                      className="h-6 w-6 p-0 text-white/60 hover:text-white"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>

                <TableCell className="text-white/60">
                  {new Date(generatedKey.created).toLocaleDateString()}
                </TableCell>

                <TableCell className="text-white/60">
                  {generatedKey.lastUsed
                    ? new Date(generatedKey.lastUsed).toLocaleDateString()
                    : 'Never'}
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      generatedKey.revoked
                        ? 'bg-red-400/20 text-red-400'
                        : 'bg-green-400/20 text-green-400'
                    }`}
                  >
                    {generatedKey.revoked ? 'Revoked' : 'Active'}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      )} */}

      {/* Display All API Keys */}
      <Card className="border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white">Your API Keys</h2>
          <p className="mt-1 text-sm text-white/60">
            Manage your API keys for accessing Label X services
          </p>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-12 bg-white/5" />
              <Skeleton className="h-12 bg-white/5" />
              <Skeleton className="h-12 bg-white/5" />
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/80">Name</TableHead>
                <TableHead className="text-white/80">API Key</TableHead>
                <TableHead className="text-white/80">Created</TableHead>
                <TableHead className="text-white/80">Last Used</TableHead>
                <TableHead className="text-white/80">Status</TableHead>
                <TableHead className="text-white/80">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow
                  key={key.id}
                  className="border-white/10 hover:bg-white/5"
                >
                  {/* Name */}
                  <TableCell className="font-medium text-white">
                    {key.name}
                  </TableCell>

                  {/* API Key */}
                  <TableCell className="font-mono text-sm text-white/80">
                    <div className="flex items-center space-x-2">
                      <span>
                        {showKeys[key.id]
                          ? key.api_key
                          : maskApiKey(key.api_key)}
                      </span>
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="cursor-pointer"
                      >
                        {showKeys[key.id] ? (
                          <EyeOff className="h-4 w-4 text-white/50" />
                        ) : (
                          <Eye className="h-4 w-4 text-white/50" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.api_key)}
                        className="cursor-pointer"
                      >
                        <Copy className="h-4 w-4 text-white/50" />
                      </button>
                    </div>
                  </TableCell>

                  <TableCell className="text-white/60">
                    {new Date(key.created).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-white/60">
                    {key.lastUsed || 'Never'}
                  </TableCell>

                  <TableCell className="text-white/60">
                    {key.revoked ? (
                      <span className="text-red-500">Revoked</span>
                    ) : (
                      <span className="text-green-500">Active</span>
                    )}
                  </TableCell>

                  <TableCell className="text-white/60">
                    <div className="flex items-center gap-3">
                      {!key.revoked && (
                        <button
                          onClick={() => revokeApiKey(key.id)}
                          className="cursor-pointer transition-colors hover:text-yellow-500"
                          aria-label="Revoke Key"
                        >
                          <Key className="h-4 w-4 text-yellow-400" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowDeleteModal(true)
                          setApiKeyToDelete(key.id)
                        }}
                        className="cursor-pointer transition-colors hover:text-red-600"
                        aria-label="Delete Key"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {apiKeyToDelete && (
                <DeleteConfirmationModal
                  isOpen={showDeleteModal}
                  onClose={() => setShowDeleteModal(false)}
                  onConfirm={() => {
                    deleteApiKey(apiKeyToDelete)
                    setApiKeyToDelete(null)
                    setShowDeleteModal(false)
                  }}
                  title="Delete API Key"
                  isLoading={isDeleting}
                />
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashboardLayout>
  )
}
