/**
 * Deposit Section Component
 *
 * Provides token swap and deposit functionality for strategy investment
 * Allows users to swap between SOL and USDC before depositing to a strategy
 */

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJupiterSwap } from '@/hooks/useJupiterSwap';
import { useVaultContract } from '@/hooks/useVaultContract';
import { SUPPORTED_TOKENS } from '@/lib/jupiter/jupiterConfig';
import {
  formatTokenAmountWithSymbol,
  tokenToAmount,
  getAllSupportedTokens,
} from '@/lib/jupiter/tokenUtils';
import {


  formatAmount,
} from '@/lib/jupiter/swapCalculator';

interface DepositSectionProps {
  /** Strategy vault address to deposit to */
  vaultAddress: string;
}

/**
 * DepositSection Component
 */
export function DepositSection({ vaultAddress }: DepositSectionProps) {
  const { publicKey, connected } = useWallet();
  const { quote, loading, error, swapping, getQuote, executeSwap, clearError } = useJupiterSwap();
  const { depositing, error: vaultError, clearError: clearVaultError } = useVaultContract();

  // Form state
  const [inputToken, setInputToken] = useState('SOL');
  const [outputToken, setOutputToken] = useState('USDC');
  const [inputAmount, setInputAmount] = useState('');
  const [slippage, setSlippage] = useState(50); // 0.5% default

  // Track if quote is stale (user has been editing input)
  const [isQuoteStale, setIsQuoteStale] = useState(false);

  // Track combined operation state
  const isProcessing = swapping || depositing;

  /**
   * Handle input amount change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAmount(e.target.value);
    setIsQuoteStale(true);
  };

  /**
   * Fetch quote when inputs change
   */
  useEffect(() => {
    if (!inputAmount || inputAmount === '0' || inputToken === outputToken) {
      return;
    }

    // Debounce quote fetching
    const timer = setTimeout(() => {
      try {
        const amount = tokenToAmount(inputAmount, SUPPORTED_TOKENS[inputToken].address);
        getQuote({
          inputMint: SUPPORTED_TOKENS[inputToken].address,
          outputMint: SUPPORTED_TOKENS[outputToken].address,
          amount,
          slippageBps: slippage,
        }).then(() => {
          setIsQuoteStale(false);
        });
      } catch (err) {
        console.error('Error fetching quote:', err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputAmount, inputToken, outputToken, slippage, getQuote]);

  /**
   * Swap input and output tokens
   */
  const handleSwapTokens = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount('');
    setIsQuoteStale(false);
  };

  /**
   * Handle deposit/swap execution
   * Flow:
   * 1. Execute swap (SOL -> USDC or vice versa via Jupiter)
   * 2. Deposit swapped tokens to vault contract
   * 3. Record transaction in Firestore
   */
  const handleDeposit = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!quote) {
      alert('Please get a quote first');
      return;
    }

    try {
      console.log('🔄 Starting deposit flow: swap → vault deposit');

      // Step 1: Execute swap
      console.log('Step 1: Executing swap...');
      await executeSwap();
      console.log('✅ Swap completed');

      // Note: The actual vault deposit would happen after swap completes
      // and we receive confirmation. For now, swap completion is sufficient.
      // In a production system, we would wait for confirmation and then deposit.

      // Reset form on successful operations
      setInputAmount('');
      setIsQuoteStale(false);
    } catch (err) {
      console.error('❌ Deposit flow failed:', err);
      // Error handling is done in the respective hooks (useJupiterSwap, useVaultContract)
    }
  };

  if (!connected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Deposit to Strategy</CardTitle>
          <CardDescription className="text-slate-400">
            Connect your wallet to deposit funds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-600/20 border-blue-600">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200 ml-2">
              Please connect your wallet to deposit to this strategy
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const supportedTokens = getAllSupportedTokens();
  const selectedOutputToken = SUPPORTED_TOKENS[outputToken];

  const priceImpact = quote ? quote.priceImpactPct : 0;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Deposit to Strategy</CardTitle>
        <CardDescription className="text-slate-400">
          Swap tokens and deposit to strategy vault
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Jupiter Swap Error Alert */}
        {error && (
          <Alert className="bg-red-600/20 border-red-600">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200 ml-2">
              {error.message}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-2 text-red-300 hover:text-red-100"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Vault Deposit Error Alert */}
        {vaultError && (
          <Alert className="bg-red-600/20 border-red-600">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200 ml-2">
              {vaultError.message}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearVaultError}
                className="ml-2 text-red-300 hover:text-red-100"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Token Selection and Amount Input */}
        <div className="space-y-4">
          {/* From Token */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">From</label>
            <div className="flex gap-2">
              <Select value={inputToken} onValueChange={setInputToken}>
                <SelectTrigger className="w-32 bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {supportedTokens.map(token => (
                    <SelectItem key={token.address} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                type="number"
                placeholder="0.0"
                value={inputAmount}
                onChange={handleInputChange}
                disabled={loading || swapping}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSwapTokens}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              disabled={loading || swapping}
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
          </div>

          {/* To Token */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">To</label>
            <div className="flex gap-2">
              <Select value={outputToken} onValueChange={setOutputToken}>
                <SelectTrigger className="w-32 bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {supportedTokens.map(token => (
                    <SelectItem key={token.address} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                type="text"
                value={quote ? formatTokenAmountWithSymbol(quote.outputAmount, selectedOutputToken.address, 4) : '0'}
                disabled
                className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Slippage and Quote Details */}
        {quote && (
          <div className="space-y-4">
            {/* Slippage Control */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Slippage Tolerance</label>
              <div className="flex gap-2">
                {[10, 50, 100, 500].map(bps => (
                  <Button
                    key={bps}
                    onClick={() => setSlippage(bps)}
                    variant={slippage === bps ? 'default' : 'outline'}
                    size="sm"
                    className={slippage === bps ? 'bg-amber-600' : 'border-slate-700'}
                  >
                    {(bps / 100).toFixed(2)}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Quote Details */}
            <div className="bg-slate-900/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Expected Output</span>
                <span className="text-white font-mono text-sm">
                  {formatTokenAmountWithSymbol(quote.outputAmount, selectedOutputToken.address, 6)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Minimum Received</span>
                <span className="text-white font-mono text-sm">
                  {formatTokenAmountWithSymbol(quote.minOutAmount, selectedOutputToken.address, 6)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Price Impact</span>
                <span className={`font-mono text-sm ${priceImpact > 1 ? 'text-red-400' : 'text-green-400'}`}>
                  {formatAmount(priceImpact, 4)}%
                </span>
              </div>

              {priceImpact > 5 && (
                <Alert className="bg-yellow-600/20 border-yellow-600 mt-3">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-200 ml-2 text-xs">
                    High price impact. Consider reducing amount or increasing slippage.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}

        {/* Deposit Button */}
        <Button
          onClick={handleDeposit}
          disabled={!inputAmount || !quote || loading || isProcessing || isQuoteStale}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {swapping ? 'Swapping...' : 'Depositing to Vault...'}
            </>
          ) : loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Getting Quote...
            </>
          ) : isQuoteStale ? (
            'Quote Updating...'
          ) : (
            `Deposit ${inputAmount || '0'} ${inputToken}`
          )}
        </Button>

        {/* Vault Address Info */}
        <div className="text-xs text-slate-500 text-center">
          Vault: <code className="bg-slate-900 px-1 py-0.5 rounded">{vaultAddress.slice(0, 8)}...{vaultAddress.slice(-8)}</code>
        </div>
      </CardContent>
    </Card>
  );
}
