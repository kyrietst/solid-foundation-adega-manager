# Nuvem Fiscal: QR Code Strategy (Nuclear Option)

**Version:** 1.0\
**Last Updated:** 2025-01-16\
**Module:** Fiscal (NFC-e)

---

## 1. The Problem: "Skeleton Responses"

The Nuvem Fiscal API (v2) often returns a "Skeleton" JSON response immediately
after emission (`POST /nfce`). This response contains the `status: 'autorizado'`
and the `id`, but **frequently omits** the `url_consulta_qrcode` or puts it in
unpredictable fields depending on the state of the SEFAZ servers.

**Result:** The user sees "Nota Autorizada" but the receipt prints without a QR
Code (or with a blank space), making the document legally invalid for the
consumer.

---

## 2. The Solution: "Nuclear" XML Extraction

To guarantee the QR Code presence 100% of the time, we bypass the JSON
unpredictability and go to the source of truth: the **XML**.

### The Protocol (Implemented in `fiscal-handler`)

1. **Emission:** We send the `POST /nfce` request.
2. **Check:** We check if `apiData` has any known QR Code field
   (`url_consulta_qrcode`, `qrcode_url`, `sefazUrlQrCode`).
3. **Rescue Mission:** If NO field is found (which is common), we initiate the
   "Nuclear Option":
   - **Step A:** Wait 500ms (propagation buffer).
   - **Step B:** Fetch the raw XML from the API: `GET /nfce/{id}/xml`.
   - **Step C:** Parse the XML string using **Regex** (not an XML parser, for
     performance and resilience).

### The Regex Logic

We use a "Hardened" Regex that is agnostic to Namespaces (`nfe:`) and
whitespace.

```typescript
// Matches <qrCode>, <nfe:qrCode>, or <ns1:qrCode>
// Captures content regardless of CDATA or whitespace
const qrMatch = xmlText.match(
  /<(\w+:)?qrCode[^>]*>([\s\S]*?)<\/(\w+:)?qrCode>/i,
);
```

### Fallback

If the direct `<qrCode>` tag is missing (rare), we search inside the
`<infNFeSupl>` tag, which often contains the QR URL as raw text in some SEFAZ
responses.

```typescript
const infMatch = xmlText.match(
  /<(\w+:)?infNFeSupl[^>]*>([\s\S]*?)<\/(\w+:)?infNFeSupl>/i,
);
```

---

## 3. Why this matters (Context for Future Devs)

If you refactor `fiscal-handler`, **DO NOT REMOVE THIS LOGIC**. Relying solely
on the JSON response from `POST /nfce` WILL result in missing QR Codes in
production. The XML is the only immutable proof that the QR Code exists.

---

## 4. Frontend Sync

The `fiscal-handler` forces the rescued URL back into the `apiData.qrcode_url`
field of the JSON response before sending it to the Client. This ensures the
`ReceiptModal` updates immediately without requiring a page refresh.
