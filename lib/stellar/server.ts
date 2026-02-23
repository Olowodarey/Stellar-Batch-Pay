/**
 * Server-only utilities for Stellar operations
 * This file is only executed on the server and should never be imported in client components
 */

import {
  Keypair,
  TransactionBuilder,
  BASE_FEE,
  Networks,
  Asset as StellarAsset,
  Operation,
  Server,
} from 'stellar-sdk';
import { PaymentInstruction, BatchResult, PaymentResult, BatchConfig } from './types';
import { createBatches, parseAsset } from './batcher';
import { validatePaymentInstruction, validateBatchConfig } from './validator';

export class StellarService {
  private keypair: Keypair;
  private server: Server;
  private network: 'testnet' | 'mainnet';
  private maxOperationsPerTransaction: number;

  constructor(config: BatchConfig) {
    // Validate configuration
    const validation = validateBatchConfig(config);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    this.keypair = Keypair.fromSecret(config.secretKey);
    this.network = config.network;
    this.maxOperationsPerTransaction = config.maxOperationsPerTransaction;

    // Initialize Stellar server based on network
    const serverUrl = config.network === 'testnet'
      ? 'https://horizon-testnet.stellar.org'
      : 'https://horizon.stellar.org';
    this.server = new Server(serverUrl);
  }

  /**
   * Submit a batch of payments to the Stellar network
   */
  async submitBatch(instructions: PaymentInstruction[]): Promise<BatchResult> {
    const results: PaymentResult[] = [];
    const startTime = new Date();

    try {
      // Get source account
      const sourceAccount = await this.server.loadAccount(this.keypair.publicKey());

      // Batch payments
      const batches = createBatches(
        instructions,
        this.maxOperationsPerTransaction
      );

      let txCount = 0;
      let totalAmount = '0';

      // Submit each batch
      for (const batch of batches) {
        try {
          // Build transaction
          let builder = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: this.network === 'testnet' 
              ? Networks.TESTNET_NETWORK_PASSPHRASE
              : Networks.PUBLIC_NETWORK_PASSPHRASE,
          });

          // Add payment operations
          for (const payment of batch.payments) {
            const validation = validatePaymentInstruction(payment);
            if (!validation.valid) {
              results.push({
                recipient: payment.address,
                amount: payment.amount,
                asset: payment.asset,
                status: 'failed',
                transactionHash: undefined,
                error: validation.error,
              });
              continue;
            }

            const asset = parseAsset(payment.asset);
            builder = builder.addOperation(
              Operation.payment({
                destination: payment.address,
                asset,
                amount: payment.amount,
              })
            );

            // Add amount to total
            totalAmount = String(Number(totalAmount) + Number(payment.amount));

            results.push({
              recipient: payment.address,
              amount: payment.amount,
              asset: payment.asset,
              status: 'pending',
              transactionHash: undefined,
            });
          }

          // Set timeout and sign
          const transaction = builder
            .setTimeout(300)
            .build();

          transaction.sign(this.keypair);

          // Submit to network
          const result = await this.server.submitTransaction(transaction);
          txCount++;

          // Update successful results
          for (const operation of result.result_meta_xdr) {
            const opResult = operation as Record<string, unknown>;
            if (opResult.result?.code === 0) {
              const resultIndex = results.findIndex(r => r.status === 'pending');
              if (resultIndex >= 0) {
                results[resultIndex].status = 'success';
                results[resultIndex].transactionHash = result.hash;
              }
            }
          }
        } catch (error) {
          // Mark batch results as failed
          for (const result of results) {
            if (result.status === 'pending') {
              result.status = 'failed';
              result.error = error instanceof Error ? error.message : 'Unknown error';
            }
          }
        }
      }

      const endTime = new Date();

      return {
        batchId: `batch-${Date.now()}`,
        totalRecipients: instructions.length,
        totalAmount,
        totalTransactions: txCount,
        results,
        summary: {
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'failed').length,
        },
        timestamp: startTime.toISOString(),
        submittedAt: endTime.toISOString(),
        network: this.network,
      };
    } catch (error) {
      throw new Error(
        `Batch submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get the public key of the account
   */
  getPublicKey(): string {
    return this.keypair.publicKey();
  }
}
