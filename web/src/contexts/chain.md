### Offer How To

See https://github.com/agoric/ui-kit

```jsx
const MyComponent = () => {
  const { connection } = useChain();
  function makeOffer() {
    try {
      connection.makeOffer(
        {
          source: 'agoricContract',
          instancePath: ['SimpleSwapExampleInstance'],
          callPipe: [
            ['getSwapManagerForBrand', [amountToGive.brand]],
            ['makeSwapOffer']
          ]
        },
        {
          give: { In: amountToGive },
          want: { Out: amountToWant },
        },
        { exampleArg: 'foo' },
        ({ status, data }) => {
          if (status === 'error') {
            console.error('Offer error', data);
          }
          if (status === 'seated') {
            console.log('Transaction submitted:', data.txn);
            console.log('Offer id:', data.offerId);
          }
          if (status === 'refunded') {
            console.log('Offer refunded');
          }
          if (status === 'accepted') {
            console.log('Offer accepted');
          }
        },
      );
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  return (
    <></>
  )
}
```