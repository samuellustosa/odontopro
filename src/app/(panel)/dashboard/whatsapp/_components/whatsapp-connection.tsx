'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Smartphone, CheckCircle, XCircle, QrCode } from 'lucide-react'

interface WhatsAppConnectionProps {
  user:{
    subscription: {
      id: string;
      status: string;
      createAt: Date;
      userId: string;
      plan: any;
      priceid: string;
    } | null
  } | null
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'qr_pending' | 'connected' | 'error'

export function WhatsAppConnection({ user }: WhatsAppConnectionProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [instanceId, setInstanceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Usar useRef para armazenar os IDs dos timers (números)
  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  // Função para desconectar e limpar timers
  const clearTimers = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  // Função para conectar WhatsApp
  const handleConnect = async () => {
    setIsLoading(true)
    setStatus('connecting')
    try {
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setQrCode(data.qrCode)
        setInstanceId(data.instanceId)
        setStatus('qr_pending')
        toast.success('QR Code gerado! Escaneie com seu WhatsApp.')
        // Iniciar verificação de status
        startStatusCheck(data.instanceId)
      } else {
        throw new Error(data.error || 'Erro ao conectar')
      }
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error)
      setStatus('error')
      toast.error('Erro ao conectar WhatsApp. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Função para verificar status periodicamente
  const startStatusCheck = (instanceId: string) => {
    // Limpar timers anteriores, se houver
    clearTimers()

    intervalRef.current = window.setInterval(async () => {
      try {
        const response = await fetch('/api/whatsapp/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ instanceId }),
        })
        const data = await response.json()
        if (data.success) {
          if (data.status === 'connected') {
            setStatus('connected')
            setQrCode(null)
            toast.success('WhatsApp conectado com sucesso!')
            clearTimers()
          } else if (data.status === 'disconnected' || data.status === 'error') {
            setStatus('error')
            setQrCode(null)
            toast.error('Falha na conexão do WhatsApp.')
            clearTimers()
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
      }
    }, 3000) // Verificar a cada 3 segundos

    timeoutRef.current = window.setTimeout(() => {
      if (status === 'qr_pending') {
        setStatus('error')
        setQrCode(null)
        toast.error('Tempo limite para conexão expirado.')
      }
      clearTimers()
    }, 300000) // 5 minutos
  }

  // Função para desconectar
  const handleDisconnect = () => {
    clearTimers()
    setStatus('disconnected')
    setQrCode(null)
    setInstanceId(null)
    toast.info('WhatsApp desconectado.')
  }

  // Limpar timers quando o componente desmontar
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  // Renderizar ícone de status
  const renderStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'connecting':
      case 'qr_pending':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Smartphone className="h-5 w-5 text-gray-500" />
    }
  }

  // Renderizar texto de status
  const renderStatusText = () => {
    switch (status) {
      case 'connected':
        return 'WhatsApp Conectado'
      case 'connecting':
        return 'Conectando...'
      case 'qr_pending':
        return 'Aguardando leitura do QR Code'
      case 'error':
        return 'Erro na conexão'
      default:
        return 'WhatsApp Desconectado'
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {renderStatusIcon()} Gerenciar Conexão WhatsApp
        </CardTitle>
        <CardDescription>{renderStatusText()}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        {qrCode && status === 'qr_pending' && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500">Escaneie o QR Code com seu celular:</p>
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code"
              className="w-48 h-48 border p-2 rounded-md"
            />
            <p className="text-xs text-gray-400">Aguardando conexão...</p>
          </div>
        )}
        {status === 'connected' && (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold text-green-600">Conectado!</p>
            <p className="text-sm text-gray-500">Sua instância do WhatsApp está ativa.</p>
          </div>
        )}
        {(status === 'disconnected' || status === 'error') && !qrCode && (
          <div className="flex flex-col items-center gap-2">
            <Smartphone className="h-12 w-12 text-gray-400" />
            <p className="text-lg font-semibold text-gray-600">Não Conectado</p>
            <p className="text-sm text-gray-500">Clique para conectar seu WhatsApp.</p>
          </div>
        )}
        <Button
          onClick={handleConnect}
          disabled={isLoading || status === 'connected' || status === 'qr_pending'}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <QrCode className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Conectando...' : 'Conectar WhatsApp'}
        </Button>
        {status === 'connected' && (
          <Button onClick={handleDisconnect} variant="outline" className="w-full">
            Desconectar WhatsApp
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
