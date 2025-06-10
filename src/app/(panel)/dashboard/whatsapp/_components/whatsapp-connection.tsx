// src/app/(panel)/dashboard/whatsapp/_components/whatsapp-connection.tsx

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Smartphone, CheckCircle, XCircle, QrCode } from 'lucide-react'

interface WhatsAppConnectionProps {
  userId: string
}

// Incluí 'open' no tipo, já que a Evolution API retorna 'open' para conectado.
type ConnectionStatus = 'disconnected' | 'connecting' | 'qr_pending' | 'connected' | 'open' | 'error'

export function WhatsAppConnection({ userId }: WhatsAppConnectionProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [instanceId, setInstanceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // *** NOVO: useEffect para carregar o status salvo ao montar o componente ***
  useEffect(() => {
    const loadSavedConnection = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/whatsapp/load-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const data = await response.json();

        if (data.success && data.instanceId) {
          const loadedStatus = data.status as ConnectionStatus;
          setStatus(loadedStatus);
          setInstanceId(data.instanceId);
          setQrCode(data.qrCode || null); // Pode carregar QR Code se ainda for qr_pending

          if (loadedStatus === 'connected' || loadedStatus === 'open') {
            toast.info('Sessão WhatsApp restaurada e conectada.');
            // Se já conectado, iniciar a verificação de status para garantir que continua online
            startStatusCheck(data.instanceId);
          } else if (loadedStatus === 'qr_pending') {
            toast.info('Sessão WhatsApp restaurada. Aguardando leitura do QR Code.');
            // Se ainda está esperando QR, continuar verificando
            startStatusCheck(data.instanceId);
          } else {
            toast.info(`Sessão WhatsApp restaurada com status: ${loadedStatus}.`);
          }
        } else {
          setStatus('disconnected'); // Nenhuma conexão salva ou falha ao carregar
        }
      } catch (error) {
        console.error('Erro ao carregar conexão salva:', error);
        setStatus('disconnected');
        toast.error('Erro ao carregar sessão WhatsApp salva.');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) { // Apenas carrega se tiver um userId
      loadSavedConnection();
    }
  }, [userId]); // Depende do userId para carregar a conexão específica do usuário

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

        // *** NOVO: Salvar status inicial no DB ***
        await fetch('/api/whatsapp/save-connection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                instanceId: data.instanceId,
                status: 'qr_pending', // Salva o status que o frontend está exibindo
                qrCode: data.qrCode // Salva o QR Code também para reexibir se necessário
            }),
        });

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
    const interval = setInterval(async () => {
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
          // Reconhecer 'open' como 'connected'
          if (data.status === 'connected' || data.status === 'open') {
            setStatus('connected') // Define o status do componente como 'connected'
            setQrCode(null) // QR Code não é mais necessário quando conectado
            toast.success('WhatsApp conectado com sucesso!')
            clearInterval(interval)

            // *** NOVO: Salvar status 'connected' no DB ***
            await fetch('/api/whatsapp/save-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    instanceId: instanceId, // Usar instanceId do parâmetro
                    status: 'connected', // Salva 'connected' no DB
                    qrCode: null // Limpar QR Code no DB
                }),
            });

          } else if (data.status === 'disconnected' || data.status === 'error') {
            setStatus('error')
            setQrCode(null)
            toast.error('Falha na conexão do WhatsApp.')
            clearInterval(interval)

            // *** NOVO: Salvar status 'error'/'disconnected' no DB ***
            await fetch('/api/whatsapp/save-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    instanceId: instanceId,
                    status: data.status, // Salva o status de erro/desconexão
                    qrCode: null
                }),
            });

          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
      }
    }, 3000)

    // Limpar interval após 5 minutos (timeout)
    setTimeout(() => {
      clearInterval(interval)
      if (status === 'qr_pending') {
        setStatus('error')
        setQrCode(null)
        toast.error('Tempo limite para conexão expirado.')

        // *** NOVO: Salvar status 'error' por timeout no DB ***
        fetch('/api/whatsapp/save-connection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                instanceId: instanceId,
                status: 'error',
                qrCode: null
            }),
        });
      }
    }, 300000)
  }

  // Função para desconectar
  const handleDisconnect = async () => { // Adicione 'async' aqui
    setStatus('disconnected')
    setQrCode(null)
    // O instanceId do estado é o que precisamos enviar para a API de desconexão
    const currentInstanceId = instanceId; // Capture o valor antes de limpar o estado local
    setInstanceId(null)
    toast.info('WhatsApp desconectado.')
  
    if (currentInstanceId) {
      try {
        // *** NOVO: Chamar API para desconectar na Evolution API via n8n ***
        const response = await fetch('/api/whatsapp/disconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instanceId: currentInstanceId }),
        });
        const data = await response.json();
  
        if (data.success) {
          toast.success('Comando de desconexão enviado para o WhatsApp.');
          // *** Atualizar status no DB para 'disconnected' (já deve ser feito pela save-connection) ***
          // Chamar a API de salvar novamente para marcar como desconectado
          await fetch('/api/whatsapp/save-connection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId, // Passar userId
              instanceId: currentInstanceId,
              status: 'disconnected',
              qrCode: null
            }),
          });
        } else {
          toast.error(data.error || 'Erro ao enviar comando de desconexão.');
          // Manter status de erro local se o comando falhou
          setStatus('error');
        }
      } catch (error) {
        console.error('Erro ao desconectar WhatsApp no frontend:', error);
        toast.error('Erro de rede ao tentar desconectar.');
        setStatus('error');
      }
    }
  }
  

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
        <CardDescription>
          {renderStatusText()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        {qrCode && (status === 'qr_pending' || status === 'connecting') && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500">Escaneie o QR Code com seu celular:</p>
            <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="w-48 h-48 border p-2 rounded-md" />
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
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="w-full"
          >
            Desconectar WhatsApp
          </Button>
        )}
      </CardContent>
    </Card>
  )
}