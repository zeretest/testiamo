<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Belvedere Smart - Cloud ERP Definitivo</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
    
    <style>
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .view-panel { display: none; }
        .view-panel.active { display: block; animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { 
            from { opacity: 0; transform: translateY(10px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
        .status-badge { 
            font-size: 9px; 
            font-weight: 900; 
            text-transform: uppercase; 
            padding: 4px 8px; 
            border-radius: 99px; 
            cursor: pointer; 
            transition: transform 0.1s; 
        }
        .status-badge:active { transform: scale(0.90); }
        .hide-scroll::-webkit-scrollbar { display: none; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; margin: 0; 
        }
    </style>
</head>
<body class="bg-slate-50 font-sans text-slate-900 h-screen overflow-hidden flex flex-col relative">

    <div id="error-overlay" class="hidden fixed inset-0 bg-red-600 z-[999] flex flex-col items-center justify-center text-white p-6 text-center">
        <i class="fas fa-exclamation-triangle text-6xl mb-4"></i>
        <h2 class="text-3xl font-black mb-2 uppercase">Errore di Sistema</h2>
        <p id="error-msg" class="text-sm font-bold opacity-90 mb-6 bg-red-800 p-5 rounded-2xl border border-red-500 shadow-lg whitespace-pre-wrap"></p>
        <button onclick="location.reload()" class="bg-white text-red-600 px-8 py-4 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition">Ricarica App</button>
    </div>

    <div id="modal-storico-prezzi" class="hidden fixed inset-0 bg-slate-900/80 z-[300] flex flex-col items-center justify-end sm:justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-[fadeIn_0.2s_ease-out]">
            <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div class="pr-4">
                    <h3 id="storico-modal-titolo" class="font-black text-base text-slate-800 uppercase leading-tight">Nome Articolo</h3>
                    <p id="storico-modal-fornitore" class="text-[10px] font-bold text-emerald-600 uppercase mt-1 tracking-wider">Fornitore</p>
                </div>
                <button onclick="chiudiStoricoPrezzi()" class="text-slate-400 hover:text-red-500 bg-white border border-slate-200 w-10 h-10 rounded-xl shadow-sm flex items-center justify-center transition active:scale-90">
                    <i class="fas fa-times text-lg"></i>
                </button>
            </div>
            <div id="storico-modal-lista" class="p-5 overflow-y-auto space-y-3 bg-slate-50 flex-1">
                </div>
        </div>
    </div>

    <div id="view-login" class="view-panel active h-full flex flex-col justify-center items-center bg-slate-900 px-6 fixed inset-0 z-[100]">
        <div class="text-center mb-8">
            <div class="bg-emerald-500 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5 rotate-3 shadow-2xl border-4 border-slate-800">
                <i class="fas fa-utensils text-5xl text-white -rotate-3"></i>
            </div>
            <h1 class="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">Belvedere</h1>
            <p class="text-emerald-400 text-[11px] font-bold tracking-widest uppercase">Cloud Management</p>
        </div>
        <div class="w-full max-w-sm space-y-4">
            <input type="email" id="email-field" class="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-2xl py-4 px-6 focus:outline-none focus:border-emerald-500 font-bold tracking-widest text-center text-sm" placeholder="EMAIL RISTORANTE">
            <input type="password" id="pass-field" class="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-2xl py-4 px-6 focus:outline-none focus:border-emerald-500 font-bold tracking-widest text-center text-lg" placeholder="PASSWORD">
            <button onclick="handleAuth()" id="btn-login" class="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 uppercase tracking-widest text-sm transition">Accedi Sicuro</button>
        </div>
    </div>

    <div id="app-interface" class="hidden h-full flex flex-col">
        
        <header class="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-20">
            <div>
                <h2 id="header-title" class="text-xl font-black text-slate-800">Dashboard</h2>
                <div id="role-badge" class="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest mt-1 bg-amber-100 text-amber-700">Titolare</div>
            </div>
            <div class="flex gap-3">
                <button onclick="nav('view-shopping')" class="relative bg-slate-100 w-11 h-11 rounded-full flex items-center justify-center text-slate-600 transition active:bg-slate-200">
                    <i class="fas fa-shopping-basket"></i>
                    <span id="alert-shopping-count" class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center hidden">0</span>
                </button>
                <button onclick="eseguiLogout()" class="bg-red-50 w-11 h-11 rounded-full flex items-center justify-center text-red-500 active:bg-red-100 transition">
                    <i class="fas fa-power-off"></i>
                </button>
            </div>
        </header>

        <main class="flex-1 overflow-y-auto p-4 pb-32 hide-scroll bg-slate-50">
            
            <div id="view-dashboard" class="view-panel space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-white p-5 rounded-3xl border shadow-sm flex flex-col justify-center">
                        <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Incasso Mensile</p>
                        <p id="dash-income" class="text-2xl font-black text-emerald-600">€ 0.00</p>
                    </div>
                    <div class="bg-white p-5 rounded-3xl border shadow-sm flex flex-col justify-center">
                        <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Valore Stock</p>
                        <p id="dash-total-value" class="text-2xl font-black text-slate-700">€ 0.00</p>
                    </div>
                </div>
                
                <button onclick="nav('view-finanza')" class="w-full bg-slate-900 text-white p-6 rounded-3xl shadow-lg flex justify-between items-center active:scale-95 transition">
                    <div class="text-left">
                        <h3 class="font-black text-emerald-400 text-lg"><i class="fas fa-wallet mr-3"></i>Bilancio & Debiti</h3>
                        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestione Finanziaria Completa</p>
                    </div>
                    <i class="fas fa-chevron-right text-slate-600 text-xl"></i>
                </button>
                
                <div class="grid grid-cols-2 gap-3 mt-4">
                    <button onclick="nav('view-inventory')" class="bg-white border p-6 rounded-3xl shadow-sm text-center active:scale-95 transition">
                        <i class="fas fa-boxes text-3xl text-slate-600 mb-3"></i><span class="block text-[11px] font-black uppercase">Magazzino</span>
                    </button>
                    <button onclick="nav('view-ricettario')" class="bg-white border p-6 rounded-3xl shadow-sm text-center active:scale-95 transition">
                        <i class="fas fa-book-open text-3xl text-blue-500 mb-3"></i><span class="block text-[11px] font-black uppercase">Distinta Base</span>
                    </button>
                    <button onclick="nav('view-fatture')" class="bg-white border p-6 rounded-3xl shadow-sm text-center active:scale-95 transition">
                        <i class="fas fa-file-invoice-dollar text-3xl text-amber-500 mb-3"></i><span class="block text-[11px] font-black uppercase">Fatture XML</span>
                    </button>
                    <button onclick="nav('view-fornitori')" class="bg-white border p-6 rounded-3xl shadow-sm text-center active:scale-95 transition">
                        <i class="fas fa-truck text-3xl text-purple-500 mb-3"></i><span class="block text-[11px] font-black uppercase">Fornitori</span>
                    </button>
                    <button onclick="nav('view-staff')" class="bg-white border p-6 rounded-3xl shadow-sm text-center active:scale-95 transition">
                        <i class="fas fa-users text-3xl text-slate-500 mb-3"></i><span class="block text-[11px] font-black uppercase">Gestione Staff</span>
                    </button>
                    <button onclick="nav('view-cassa')" class="bg-white border p-6 rounded-3xl shadow-sm text-center active:scale-95 transition">
                        <i class="fas fa-sync text-3xl text-emerald-500 mb-3"></i><span class="block text-[11px] font-black uppercase">Sincro RCH</span>
                    </button>
                </div>
            </div>

            <div id="view-finanza" class="view-panel space-y-4">
                
                <input type="month" id="finanza-mese-selettore" onchange="renderFinanzaList()" class="w-full font-black text-lg text-slate-700 bg-white border-2 border-slate-200 p-4 rounded-2xl outline-none text-center shadow-sm focus:border-emerald-500">
                
                <div class="bg-slate-900 p-6 rounded-3xl shadow-xl text-center relative overflow-hidden">
                    <div id="finanza-saldo-segno" class="inline-block text-[10px] font-black uppercase px-4 py-1.5 rounded-full mb-2 bg-slate-700 text-white">CALCOLO IN CORSO...</div>
                    <p id="finanza-saldo" class="text-5xl font-black text-emerald-400 my-2">€ 0.00</p>
                    
                    <div class="bg-slate-800 rounded-2xl p-4 my-4 flex justify-between items-center border border-slate-700">
                        <div class="text-left">
                            <p class="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Saldo IVA Attuale</p>
                            <p id="finanza-iva-totale" class="text-xl font-black text-white">€ 0.00</p>
                        </div>
                        <span id="finanza-iva-badge" class="text-[9px] font-black uppercase px-3 py-1.5 rounded bg-slate-600 text-white">--</span>
                    </div>
                    
                    <div class="flex justify-between text-[11px] font-bold mt-5 border-t border-slate-700 pt-5">
                        <div class="text-left">
                            <p class="text-slate-400 uppercase text-[9px]">Tot. Incassato</p>
                            <p id="finanza-entrate" class="text-white text-base">€ 0.00</p>
                        </div>
                        <div class="text-center">
                            <p class="text-slate-400 uppercase text-[9px]">Spese Pagate</p>
                            <p id="finanza-uscite-pagate" class="text-white text-base">€ 0.00</p>
                        </div>
                        <div class="text-right">
                            <p class="text-red-400 uppercase text-[9px]">Debiti Aperti</p>
                            <p id="finanza-debiti" class="text-red-400 text-base font-black">€ 0.00</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-3xl border shadow-sm space-y-4">
                    <div class="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                        <button onclick="setFinanzaTab('TUTTE')" id="tab-TUTTE" class="flex-1 py-3 text-[10px] font-black uppercase rounded-xl bg-white shadow-sm text-slate-800 transition">Tutte</button>
                        <button onclick="setFinanzaTab('ENTRATE')" id="tab-ENTRATE" class="flex-1 py-3 text-[10px] font-black uppercase rounded-xl text-slate-500 transition hover:bg-slate-200">Entrate</button>
                        <button onclick="setFinanzaTab('PAGATE')" id="tab-PAGATE" class="flex-1 py-3 text-[10px] font-black uppercase rounded-xl text-slate-500 transition hover:bg-slate-200">Pagate</button>
                        <button onclick="setFinanzaTab('DA_PAGARE')" id="tab-DA_PAGARE" class="flex-1 py-3 text-[10px] font-black uppercase rounded-xl text-slate-500 transition hover:bg-slate-200">Debiti</button>
                    </div>
                    
                    <div class="flex gap-2">
                        <div class="relative flex-1">
                            <i class="fas fa-search absolute left-4 top-4 text-slate-400"></i>
                            <input type="text" id="finanza-filtro-testo" onkeyup="renderFinanzaList()" placeholder="Cerca movimento..." class="w-full pl-11 pr-4 py-3 border-2 border-slate-100 rounded-xl font-bold text-xs uppercase bg-slate-50 outline-none focus:border-emerald-500">
                        </div>
                        <button onclick="apriMovimentoManuale()" class="bg-emerald-600 text-white px-5 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition">
                            <i class="fas fa-plus mr-1"></i> Nuovo
                        </button>
                    </div>
                    
                    <div class="flex gap-3 items-center pt-3 border-t border-slate-100">
                        <button onclick="toggleAllDivs('chk-finanza')" class="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 active:bg-slate-200">
                            <i class="fas fa-check-double mr-1"></i> Seleziona Tutti
                        </button>
                        <button id="btn-bulk-finanza" onclick="eliminaSelezionati('finanza', 'chk-finanza')" class="hidden bg-red-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-md active:scale-95">
                            <i class="fas fa-trash mr-1"></i> Elimina (<span id="count-finanza">0</span>)
                        </button>
                    </div>
                </div>

                <div id="form-movimento-manuale" class="hidden bg-white p-6 rounded-3xl border shadow-2xl space-y-4 mt-2 relative border-t-4 border-t-emerald-500">
                    <button onclick="chiudiMovimentoManuale()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-2xl"><i class="fas fa-times"></i></button>
                    <h3 class="font-black text-base uppercase text-slate-800 mb-2">Nuovo Movimento</h3>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Tipo</label>
                            <select id="man-tipo" class="w-full border-2 border-slate-200 p-3 rounded-xl font-bold bg-slate-50 text-xs text-slate-700 outline-none focus:border-emerald-500">
                                <option value="uscita">USCITA (Spesa)</option>
                                <option value="entrata">ENTRATA (Incasso)</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Data Competenza</label>
                            <input type="date" id="man-data" class="w-full border-2 border-slate-200 p-3 rounded-xl font-bold bg-slate-50 text-xs text-slate-700 outline-none focus:border-emerald-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Descrizione / Intestatario</label>
                        <input type="text" id="man-desc" placeholder="Es: FATTURA FORNITORE X..." class="w-full border-2 border-slate-200 p-3 rounded-xl font-bold uppercase bg-slate-50 text-sm outline-none focus:border-emerald-500">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Importo Totale (€)</label>
                            <input type="number" id="man-importo" class="w-full border-2 border-emerald-200 p-3 rounded-xl font-black text-center text-xl text-emerald-700 bg-emerald-50 outline-none focus:border-emerald-500" placeholder="0.00">
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Di cui IVA (€)</label>
                            <input type="number" id="man-iva" class="w-full border-2 border-slate-200 p-3 rounded-xl font-black text-center text-xl text-slate-700 bg-slate-50 outline-none focus:border-emerald-500" value="0.00">
                        </div>
                    </div>
                    
                    <div>
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Stato Pagamento</label>
                        <select id="man-stato" class="w-full border-2 border-slate-200 p-3 rounded-xl font-black bg-slate-50 text-xs text-slate-700 outline-none focus:border-emerald-500">
                            <option value="pagato">GIÀ PAGATO (Saldato)</option>
                            <option value="da_pagare">DA PAGARE (Crea Debito)</option>
                        </select>
                    </div>
                    
                    <button onclick="salvaMovimentoManuale()" class="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg uppercase text-sm mt-4 active:scale-95 transition">Salva in Bilancio</button>
                </div>

                <div class="bg-white rounded-3xl border shadow-sm overflow-hidden divide-y divide-slate-100" id="finanza-list">
                    </div>
            </div>

            <div id="view-fatture" class="view-panel space-y-4">
                <div class="bg-white border-2 border-dashed border-emerald-300 p-8 rounded-3xl text-center shadow-sm hover:bg-emerald-50 transition cursor-pointer" onclick="document.getElementById('file-xml').click()">
                    <i class="fas fa-file-invoice-dollar text-5xl text-emerald-500 mb-4"></i>
                    <h4 class="font-black text-base uppercase mb-1 text-slate-800">Importa Fattura XML</h4>
                    <p class="text-[11px] text-slate-500 font-bold mb-4 uppercase">Supporta file .xml e .html (SDI)</p>
                    <input type="file" accept=".xml, .html, .htm" id="file-xml" onchange="elaboraFatturaXML(this)" class="hidden">
                    <button class="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition">Seleziona File</button>
                </div>
                
                <div id="fattura-loader" class="hidden text-center py-12">
                    <i class="fas fa-spinner fa-spin text-5xl text-emerald-600 mb-4"></i>
                    <p class="text-xs font-black uppercase text-slate-500">Lettura dati ed estrazione in corso...</p>
                </div>
                
                <div id="fattura-result" class="hidden space-y-4">
                    <div class="bg-white p-5 rounded-3xl border shadow-sm">
                        <div class="flex justify-between items-center mb-3 border-b pb-2">
                            <label class="text-xs font-black uppercase text-slate-800">Fornitore Rilevato</label>
                            <div class="flex items-center">
                                <span class="text-[10px] font-black uppercase text-slate-400 mr-2">Data Doc:</span>
                                <input type="date" id="ocr-data-doc" class="border-2 border-slate-200 p-1.5 rounded-lg font-bold text-xs text-slate-700 bg-slate-50 outline-none">
                            </div>
                        </div>
                        <select id="fattura-fornitore-select" onchange="checkFornitoreCustom()" class="w-full border-2 border-slate-200 p-3 rounded-xl font-black bg-slate-50 text-sm uppercase outline-none focus:border-emerald-500"></select>
                        <input type="text" id="fattura-fornitore-custom" placeholder="Scrivi il Nome del Nuovo Fornitore..." class="w-full border-2 border-emerald-500 p-3 rounded-xl font-black text-slate-800 uppercase outline-none mt-3 hidden bg-emerald-50">
                    </div>
                    
                    <div class="bg-white rounded-3xl border overflow-hidden shadow-sm">
                        <div class="p-4 bg-slate-100 text-[10px] font-black uppercase text-slate-600 border-b flex justify-between items-center">
                            <span>Associazione Articoli al Magazzino</span>
                            <i class="fas fa-magic text-emerald-500" title="A.I. Automatica"></i>
                        </div>
                        <div id="fattura-items-list" class="divide-y divide-slate-100 bg-white">
                            </div>
                    </div>
                    
                    <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                        <div class="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700">
                            <span class="text-[11px] font-black uppercase text-slate-300">IVA Totale Stimata:</span>
                            <div class="flex items-center">
                                <span class="text-white font-bold mr-1">€</span>
                                <input type="number" id="ocr-tot-iva" class="w-24 border-none p-1 rounded font-black text-right text-base bg-transparent text-emerald-400 outline-none">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 gap-3">
                            <select id="ocr-tipo-doc" class="w-full border border-slate-700 p-3 rounded-xl font-bold text-xs bg-slate-800 text-white outline-none">
                                <option value="merce">Fattura Merci (Scarica su Magazzino)</option>
                                <option value="bolletta">Utenza / Servizio (Solo Bilancio)</option>
                            </select>
                            
                            <select id="ocr-stato-pag" class="w-full border border-slate-700 p-3 rounded-xl font-black text-xs bg-slate-800 text-white outline-none">
                                <option value="pagato">FATTURA GIÀ PAGATA</option>
                                <option value="da_pagare">DA PAGARE (Registra Debito)</option>
                            </select>
                        </div>
                        
                        <button onclick="confermaCaricoFattura()" class="w-full bg-emerald-500 text-slate-900 py-4 rounded-xl font-black uppercase text-sm shadow-lg active:scale-95 transition mt-2">Salva Tutto nel Cloud</button>
                    </div>
                </div>
            </div>

            <div id="view-fornitori" class="view-panel space-y-4">
                
                <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm relative">
                    <i class="fas fa-search absolute left-8 top-8 text-slate-400"></i>
                    <input type="text" id="cerca-fornitori" onkeyup="aggiornaVistaFornitori()" placeholder="Cerca Fornitore o Prodotto (Es. Aglio)..." class="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl font-black text-sm uppercase bg-slate-50 outline-none focus:border-purple-500 transition">
                </div>

                <div class="bg-purple-50 p-6 rounded-3xl border border-purple-200 shadow-sm">
                    <h3 class="font-black text-purple-900 text-base uppercase mb-3"><i class="fas fa-truck mr-2"></i> Nuovo Fornitore</h3>
                    <div class="flex gap-2">
                        <input type="text" id="new-fornitore-name" placeholder="Es. PARTESA, METRO, CARREFOUR..." class="flex-1 border-2 border-purple-200 p-3 rounded-xl font-bold text-sm uppercase bg-white outline-none focus:border-purple-500">
                        <button onclick="aggiungiFornitoreManuale()" class="bg-purple-600 text-white px-6 rounded-xl font-black active:scale-95 shadow-md transition"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                
                <div id="fornitori-list-container" class="space-y-4">
                    </div>
            </div>

            <div id="view-inventory" class="view-panel space-y-4">
                <div class="flex justify-between items-center px-2">
                    <h3 class="font-black text-slate-800 uppercase text-sm">Giacenze Magazzino</h3>
                    <div class="flex gap-2">
                        <button id="btn-bulk-stock" onclick="eliminaSelezionati('inventario', 'chk-stock')" class="hidden bg-red-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase shadow-md active:scale-95 transition">
                            <i class="fas fa-trash"></i> (<span id="count-stock">0</span>)
                        </button>
                        <button onclick="nav('view-categorie')" class="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm active:bg-slate-300 transition">
                            Categorie
                        </button>
                        <button onclick="nav('view-add-product')" class="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-md active:scale-95 transition">
                            <i class="fas fa-plus mr-1"></i> Materia
                        </button>
                    </div>
                </div>
                
                <div class="bg-white rounded-3xl border shadow-sm overflow-hidden">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-100 border-b border-slate-200">
                            <tr>
                                <th class="p-4 w-12 text-center">
                                    <input type="checkbox" onclick="toggleAllDivs('chk-stock')" class="w-4 h-4 accent-emerald-600 cursor-pointer">
                                </th>
                                <th class="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Articolo & Categoria</th>
                                <th class="p-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-wider">Giacenza</th>
                                <th class="p-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider">Azioni</th>
                            </tr>
                        </thead>
                        <tbody id="inventory-table-body" class="divide-y divide-slate-100">
                            </tbody>
                    </table>
                </div>
            </div>

            <div id="view-categorie" class="view-panel space-y-4">
                <div class="bg-white p-6 rounded-3xl border shadow-xl space-y-4">
                    <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 class="font-black text-xl text-slate-800 uppercase"><i class="fas fa-tags text-emerald-500 mr-2"></i> Categorie</h3>
                        <button onclick="nav('view-inventory')" class="text-slate-400 hover:text-slate-700 text-2xl transition"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div class="flex gap-2 pt-2">
                        <input type="text" id="nuova-cat-input" placeholder="NOME NUOVA CATEGORIA..." class="flex-1 border-2 border-slate-200 p-3 rounded-xl font-bold uppercase text-sm outline-none focus:border-emerald-500">
                        <button onclick="aggiungiCategoria()" class="bg-emerald-600 text-white px-5 rounded-xl font-black shadow-md active:scale-95 transition"><i class="fas fa-plus"></i></button>
                    </div>
                    
                    <div id="lista-categorie" class="space-y-2 mt-6">
                        </div>
                </div>
            </div>

            <div id="view-add-product" class="view-panel space-y-4">
                <div class="bg-white p-6 rounded-3xl border shadow-xl space-y-5 relative">
                    <button onclick="nav('view-inventory')" class="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-xl transition"><i class="fas fa-times"></i></button>
                    <h3 class="font-black text-xl text-slate-800 border-b border-slate-100 pb-3"><i class="fas fa-box-open text-emerald-500 mr-2"></i> Crea Materia</h3>
                    
                    <div>
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Categoria di Appartenenza</label>
                        <select id="new-cat" class="w-full border-2 border-slate-200 p-3 rounded-xl font-bold bg-slate-50 text-sm outline-none focus:border-emerald-500 mt-1"></select>
                    </div>
                    
                    <div>
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome Materia Prima (Padre)</label>
                        <input type="text" id="new-nome" placeholder="Es. FARINA 00 CAPUTO 25KG" class="w-full border-2 border-slate-200 p-3 rounded-xl font-black uppercase bg-slate-50 text-base outline-none focus:border-emerald-500 mt-1">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Giacenza Attuale</label>
                            <input type="number" id="new-qta" class="w-full border-2 border-emerald-200 p-3 rounded-xl font-black text-center text-lg text-emerald-700 bg-emerald-50 outline-none focus:border-emerald-500 mt-1" value="1">
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Avviso Scorta Minima</label>
                            <input type="number" id="new-soglia" class="w-full border-2 border-amber-200 p-3 rounded-xl font-black text-center text-lg text-amber-700 bg-amber-50 outline-none focus:border-amber-500 mt-1" value="5">
                        </div>
                    </div>
                    
                    <button onclick="salvaNuovoProdotto()" class="w-full bg-slate-900 text-white font-black py-4 rounded-xl uppercase text-sm mt-6 shadow-lg active:scale-95 transition">Salva nel Magazzino</button>
                </div>
            </div>

            <div id="view-cassa" class="view-panel space-y-4">
                <div class="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden text-center cursor-pointer hover:shadow-2xl transition" onclick="document.getElementById('file-rch-vendite').click()">
                    <i class="fas fa-cash-register text-5xl mb-4 opacity-90"></i>
                    <h3 class="font-black text-2xl uppercase tracking-tight mb-2">Importa Chiusura RCH</h3>
                    <p class="text-xs font-bold text-emerald-100 opacity-90 px-4">Carica il file "Venduto Prodotti" di XStore. Il sistema calcolerà l'incasso e scaricherà in automatico le materie prime.</p>
                    
                    <input type="file" accept=".xlsx, .xls, .csv" id="file-rch-vendite" onchange="elaboraVenditeRCHExcel(this)" class="hidden">
                    <button class="mt-6 bg-white text-emerald-700 px-8 py-3 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition">Seleziona File .xlsx</button>
                </div>
                
                <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mt-4 relative">
                    <h3 class="font-black text-slate-800 text-base mb-2 uppercase border-b border-slate-100 pb-2">Chiusura Manuale Emergenza</h3>
                    <p class="text-[10px] text-slate-400 font-bold mb-4 uppercase">Usa solo se RCH non funziona. NON scaricherà il magazzino.</p>
                    
                    <div class="flex gap-2">
                        <span class="bg-slate-100 border-2 border-slate-200 rounded-xl px-4 flex items-center justify-center font-black text-slate-500 text-xl">€</span>
                        <input type="number" id="manual-incasso-tot" class="flex-1 border-2 border-slate-200 p-4 rounded-xl font-black text-emerald-600 text-2xl text-center bg-slate-50 outline-none focus:border-emerald-500" placeholder="0.00">
                    </div>
                    
                    <button onclick="eseguiChiusuraManualePura()" class="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs shadow-md mt-4 active:scale-95 transition">Registra Incasso Lordo</button>
                </div>
            </div>

            <div id="view-ricettario" class="view-panel space-y-4">
                <div class="bg-gradient-to-r from-blue-500 to-blue-700 p-5 rounded-3xl shadow-lg flex justify-between items-center text-white">
                    <div>
                        <h3 class="font-black text-xl uppercase tracking-tighter"><i class="fas fa-book-open mr-2"></i> Distinta Base</h3>
                        <p class="text-[10px] font-bold text-blue-100 uppercase mt-1 tracking-widest">Associazioni Cassa-Magazzino</p>
                    </div>
                    <button onclick="apriCreaPiatto()" class="bg-white text-blue-600 w-12 h-12 rounded-2xl text-xl font-black shadow-md active:scale-95 transition flex items-center justify-center">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="flex justify-between items-center bg-white border border-slate-200 p-2 rounded-2xl shadow-sm px-4">
                    <div class="flex items-center gap-2">
                        <button onclick="toggleAllDivs('chk-menu')" class="text-slate-500 bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center active:bg-slate-200 transition" title="Seleziona Tutti">
                            <i class="fas fa-check-double"></i>
                        </button>
                        <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Gestione Multipla</span>
                    </div>
                    <button id="btn-bulk-menu" onclick="eliminaSelezionati('menu', 'chk-menu')" class="hidden bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-sm active:scale-95 transition">
                        <i class="fas fa-trash mr-1"></i> Elimina (<span id="count-menu">0</span>)
                    </button>
                </div>

                <div id="menu-builder-list" class="space-y-3 pb-4">
                    </div>
                
                <div id="form-crea-piatto" class="hidden bg-white p-6 rounded-3xl border shadow-2xl space-y-5 mt-4 border-t-4 border-t-blue-500 relative z-50">
                    <button onclick="chiudiCreaPiatto()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-2xl transition"><i class="fas fa-times"></i></button>
                    <h3 class="font-black text-lg text-slate-800 uppercase border-b border-slate-100 pb-2">Regola di Scarico</h3>
                    
                    <input type="hidden" id="piatto-id-modifica" value="">
                    
                    <div class="grid grid-cols-1 gap-4">
                        <div>
                            <label class="text-[10px] font-bold uppercase text-blue-600 ml-1">Nome Esatto stampato in Cassa (Il Figlio)</label>
                            <input type="text" id="piatto-nome" onkeyup="suggerisciGrammatura()" placeholder="Es: 1/4 VINO BIANCO" class="w-full border-2 border-blue-200 p-3 rounded-xl font-black uppercase text-slate-800 bg-blue-50 outline-none focus:border-blue-500 mt-1">
                        </div>
                        <div>
                            <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Categoria nel Menu</label>
                            <select id="piatto-categoria" class="w-full border-2 border-slate-200 p-3 rounded-xl font-bold bg-slate-50 uppercase text-sm text-slate-700 outline-none focus:border-blue-500 mt-1"></select>
                        </div>
                    </div>
                    
                    <div class="bg-slate-100 p-5 rounded-2xl border border-slate-200">
                        <h4 class="font-black text-[11px] text-slate-600 uppercase mb-3 flex items-center"><i class="fas fa-boxes mr-2 text-slate-400"></i> Materie Prime da Scaricare (I Padri)</h4>
                        
                        <div id="lista-ingredienti-piatto" class="space-y-2 mb-4 bg-white rounded-xl p-2 border border-slate-200 empty:hidden"></div>
                        
                        <div class="flex gap-2 items-end pt-2">
                            <div class="flex-1">
                                <label class="text-[8px] font-bold uppercase text-slate-400 ml-1">Scegli il Padre</label>
                                <select id="select-ingrediente" class="w-full border-2 border-slate-300 p-2.5 rounded-xl font-bold text-xs bg-white outline-none focus:border-blue-500"></select>
                            </div>
                            <div class="w-24">
                                <label class="text-[8px] font-bold uppercase text-blue-600 ml-1">Dose / Q.tà</label>
                                <input type="number" id="qta-ingrediente" class="w-full border-2 border-blue-300 p-2.5 rounded-xl font-black text-sm text-center bg-white text-blue-700 outline-none focus:border-blue-500" placeholder="0.25">
                            </div>
                            <button onclick="aggiungiIngredienteRicetta()" class="bg-slate-800 text-white w-12 h-[42px] rounded-xl font-black active:scale-95 transition shadow-md flex items-center justify-center">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <p class="text-[8px] text-slate-400 font-bold mt-2 text-center uppercase">Usa i decimali per litri e kg (Es: 0.25 = un quarto di litro)</p>
                    </div>
                    
                    <button onclick="salvaPiattoMenu()" class="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm mt-4 active:scale-95 transition">Salva e Attiva Regola</button>
                </div>
            </div>

            <div id="view-staff" class="view-panel space-y-4">
                <div class="bg-white p-6 rounded-3xl border shadow-sm">
                    <h4 class="font-black text-slate-800 mb-4 border-b border-slate-100 pb-2 uppercase text-lg"><i class="fas fa-hand-holding-dollar text-emerald-500 mr-2"></i> Eroga Anticipo</h4>
                    <div class="space-y-3">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-1 block">Seleziona Dipendente</label>
                        <select id="staff-select" class="w-full border-2 border-slate-200 p-4 rounded-xl font-bold bg-slate-50 text-base outline-none focus:border-emerald-500"></select>
                        
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-1 block mt-2">Importo da erogare</label>
                        <div class="flex gap-2">
                            <span class="bg-slate-100 border-2 border-slate-200 rounded-xl px-4 flex items-center justify-center font-black text-slate-500 text-lg">€</span>
                            <input type="number" id="staff-anticipo-val" placeholder="0.00" class="flex-1 border-2 border-slate-200 p-4 rounded-xl font-black text-center text-2xl text-emerald-600 bg-slate-50 outline-none focus:border-emerald-500">
                        </div>
                        
                        <button onclick="salvaAnticipoStaff()" class="w-full bg-emerald-600 text-white font-black py-4 rounded-xl uppercase text-sm shadow-md mt-2 active:scale-95 transition">Registra Anticipo nel Bilancio</button>
                    </div>
                </div>
                
                <h4 class="font-black text-slate-500 text-xs uppercase px-2 mt-6 mb-2 tracking-wider">Elenco Dipendenti</h4>
                <div class="bg-white rounded-3xl border shadow-sm overflow-hidden" id="staff-list-container">
                    </div>
                
                <div class="flex gap-2 mt-4">
                    <input type="text" id="new-staff-name" placeholder="Inserisci Nome Nuovo Dipendente..." class="flex-1 border-2 border-slate-200 p-4 rounded-xl font-bold text-sm uppercase bg-white outline-none focus:border-slate-500">
                    <button onclick="aggiungiDipendente()" class="bg-slate-900 text-white px-6 rounded-xl font-black active:scale-95 transition shadow-md"><i class="fas fa-user-plus"></i></button>
                </div>
            </div>

            <div id="view-shopping" class="view-panel space-y-4">
                
                <div class="bg-white p-6 rounded-3xl border shadow-xl">
                    <h3 class="font-black text-slate-800 text-xl mb-4 border-b border-slate-100 pb-3"><i class="fas fa-cart-shopping text-emerald-500 mr-2"></i> Crea Ordine</h3>
                    
                    <div class="relative mb-6">
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-1 block mb-1">Cerca nel tuo storico fornitori</label>
                        <div class="flex gap-2">
                            <div class="relative flex-1">
                                <i class="fas fa-search absolute left-4 top-4 text-slate-400"></i>
                                <input type="text" id="manual-shop-item" onkeyup="cercaFornitoriSpesa()" placeholder="Es: Farina, Olio, Vino..." class="w-full border-2 border-slate-200 py-3 pl-11 pr-4 rounded-xl font-black text-sm uppercase bg-slate-50 outline-none focus:border-emerald-500">
                            </div>
                            <button onclick="aggiungiVoceManualeSpesa()" class="bg-slate-900 text-white px-6 rounded-xl font-black active:scale-95 shadow-md transition text-lg">+</button>
                        </div>
                        <div id="spesa-suggestions" class="absolute z-[60] w-full bg-white border-2 border-slate-200 shadow-2xl rounded-xl mt-1 hidden max-h-64 overflow-y-auto divide-y divide-slate-100"></div>
                    </div>
                    
                    <h4 class="font-black text-slate-500 text-[10px] uppercase tracking-wider mb-2">Prodotti da Comprare:</h4>
                    <div id="manual-shopping-list" class="space-y-3 min-h-[100px]">
                        </div>
                </div>

                <div class="bg-amber-50 p-6 rounded-3xl border border-amber-200 shadow-sm mt-4">
                    <h3 class="font-black text-amber-900 text-sm mb-4 uppercase tracking-wider"><i class="fas fa-triangle-exclamation mr-2"></i> Allarmi Magazzino</h3>
                    <p class="text-[10px] text-amber-700 font-bold mb-4">Prodotti che sono scesi sotto la soglia minima impostata.</p>
                    <div id="auto-shopping-list" class="space-y-2">
                        </div>
                </div>
            </div>

        </main>

        <nav id="bottom-nav" class="bg-white border-t border-slate-200 fixed bottom-0 w-full flex justify-around py-3 z-50 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.1)] pb-safe">
            <button onclick="nav('view-dashboard')" class="flex flex-col items-center w-1/5 text-emerald-600 transition hover:text-emerald-500">
                <i class="fas fa-home text-xl mb-1"></i><span class="text-[9px] font-black uppercase">Home</span>
            </button>
            <button onclick="nav('view-ricettario')" class="flex flex-col items-center w-1/5 text-slate-400 transition hover:text-blue-500">
                <i class="fas fa-book-open text-xl mb-1"></i><span class="text-[9px] font-black uppercase">Menu</span>
            </button>
            <button onclick="nav('view-inventory')" class="flex flex-col items-center w-1/5 text-slate-400 transition hover:text-slate-700">
                <i class="fas fa-boxes text-xl mb-1"></i><span class="text-[9px] font-black uppercase">Stock</span>
            </button>
            <button onclick="nav('view-staff')" class="flex flex-col items-center w-1/5 text-slate-400 transition hover:text-slate-700">
                <i class="fas fa-users text-xl mb-1"></i><span class="text-[9px] font-black uppercase">Staff</span>
            </button>
            <button onclick="nav('view-cassa')" class="flex flex-col items-center w-1/5 text-slate-400 transition hover:text-emerald-500">
                <i class="fas fa-cash-register text-xl mb-1"></i><span class="text-[9px] font-black uppercase">Cassa</span>
            </button>
        </nav>
    </div>

    <script>
        // GESTIONE ERRORI GLOBALI
        window.onerror = function(msg, url, line) {
            console.error("Errore JS:", msg, "alla riga:", line);
            // Solo per debug gravissimi - evito di bloccare l'UI se non necessario
            return false;
        };

        // 1. VARIABILI GLOBALI E INIT SUPABASE
        const SB_URL = 'https://nizktofcamulygzszydw.supabase.co';
        const SB_KEY = 'sb_publishable_X6Oml3MZiMid06t3UKrjGw_qan_DuIH';
        const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

        let inventarioLocale = []; 
        let staffLocale = [];
        let finanzaDatiGlobali = []; 
        let currentFinanzaTab = 'TUTTE';
        let menuRistorante = []; 
        let ingredientiTempRicetta = []; 
        let fatturaItemsLetti = [];
        let fornitoriDict = {}; 
        let categorieDB = [];
        let extraShopping = [];

        // 2. FUNZIONI DI STARTUP E AUTENTICAZIONE
        window.onload = async () => { 
            let oggi = new Date(); 
            let meseSel = document.getElementById('finanza-mese-selettore');
            if (meseSel) meseSel.value = oggi.getFullYear() + '-' + String(oggi.getMonth() + 1).padStart(2, '0');
            
            let dataSel = document.getElementById('man-data');
            if (dataSel) dataSel.value = oggi.toISOString().substring(0,10);
            
            // Check Sessione Esistente (RLS)
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                await avviaApp(); 
            } else {
                document.getElementById('view-login').style.display = 'flex';
            }
        };

        window.handleAuth = async function() {
            let email = document.getElementById('email-field').value.trim();
            let password = document.getElementById('pass-field').value.trim();
            
            if (!email || !password) return alert("Inserisci Email e Password.");
            
            let btn = document.getElementById('btn-login');
            btn.innerText = "ACCESSO IN CORSO...";
            
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });
            
            if (error) {
                alert("Accesso Negato: Controlla le credenziali.");
                btn.innerText = "ACCEDI SICURO";
            } else {
                await avviaApp();
            }
        };

        window.eseguiLogout = async function() { 
            await supabaseClient.auth.signOut(); 
            location.reload(); 
        };

        window.avviaApp = async function() {
            document.getElementById('view-login').style.display = 'none'; 
            document.getElementById('app-interface').classList.remove('hidden');
            
            // Carica tutti i dati in parallelo o in sequenza sicura
            await caricaCategorieCloud(); 
            await caricaFornitoriCloud(); 
            await caricaMenuCloud(); 
            await caricaInventarioDaSupabase();
            await caricaFinanzaDaSupabase(); 
            await caricaStaff(); 
            
            nav('view-dashboard');
        };

        // NAVIGAZIONE
        window.nav = function(id) {
            document.querySelectorAll('.view-panel').forEach(v => v.classList.remove('active')); 
            document.getElementById(id).classList.add('active');
            
            document.querySelectorAll('#bottom-nav button').forEach(btn => btn.className = btn.className.replace('text-emerald-600', 'text-slate-400'));
            if(event && event.currentTarget && event.currentTarget.tagName === 'BUTTON' && event.currentTarget.parentElement.id === 'bottom-nav') {
                event.currentTarget.className = event.currentTarget.className.replace('text-slate-400', 'text-emerald-600');
            }
            
            if(id === 'view-inventory') caricaInventarioDaSupabase();
            if(id === 'view-finanza') caricaFinanzaDaSupabase();
            if(id === 'view-staff') caricaStaff();
            if(id === 'view-fornitori') caricaFornitoriCloud(); 
            if(id === 'view-add-product' || id === 'view-ricettario' || id === 'view-categorie') aggiornaVistaCategorie();
            if(id === 'view-shopping') { generaListaSpesa(); renderizzaSpesaManuale(); }
        };

        // ==========================================
        // LISTA DELLA SPESA INTELLIGENTE
        // ==========================================
        window.generaListaSpesa = function() { 
            let autoItems = inventarioLocale.filter(p => parseFloat(p.quantita) <= parseFloat(p.soglia_minima)); 
            
            let html = autoItems.map(p => `
                <div class="p-4 flex justify-between items-center bg-white rounded-xl border border-amber-200 shadow-sm">
                    <div>
                        <p class="font-black text-sm uppercase text-slate-800">${p.nome}</p>
                        <p class="text-[9px] text-red-500 font-black uppercase mt-1">Giacenza: ${p.quantita} / Soglia: ${p.soglia_minima}</p>
                    </div>
                    <i class="fas fa-triangle-exclamation text-amber-500 text-2xl drop-shadow-sm"></i>
                </div>
            `).join('');
            
            document.getElementById('auto-shopping-list').innerHTML = html || `
                <div class="bg-emerald-50 p-6 rounded-2xl text-center border border-emerald-200">
                    <i class="fas fa-check-circle text-3xl text-emerald-500 mb-2"></i>
                    <p class="font-black text-emerald-800 text-xs uppercase">Magazzino Pieno!</p>
                </div>`; 
        };
        
        window.cercaFornitoriSpesa = function() {
            let q = document.getElementById('manual-shop-item').value.trim().toUpperCase();
            let box = document.getElementById('spesa-suggestions');
            
            if(q.length < 2) { box.classList.add('hidden'); return; }

            let risultati = {}; 

            for (const [fornitore, acquisti] of Object.entries(fornitoriDict)) {
                acquisti.forEach(a => {
                    if(a.nome_fattura && a.nome_fattura.includes(q)) {
                        if(!risultati[a.nome_fattura]) risultati[a.nome_fattura] = [];
                        let existing = risultati[a.nome_fattura].find(x => x.fornitore === fornitore);
                        let p = parseFloat(a.prezzo_unitario || a.p_unit || 0); 
                        if(existing) existing.prezzo = p; 
                        else risultati[a.nome_fattura].push({ fornitore: fornitore, prezzo: p });
                    }
                });
            }

            let html = '';
            for(let item in risultati) {
                risultati[item].sort((a,b) => a.prezzo - b.prezzo);
                
                let fornitoriHTML = risultati[item].map(f => `
                    <span class="text-[9px] bg-slate-100 px-2 py-1.5 rounded-lg text-slate-700 mr-1 mt-1 inline-block border border-slate-200 font-bold">
                        <i class="fas fa-tag text-[8px] mr-1 text-emerald-600"></i>${f.fornitore}: €${f.prezzo.toFixed(2)}
                    </span>
                `).join('');
                
                let encodedData = encodeURIComponent(JSON.stringify(risultati[item]));
                let safeItem = item.replace(/'/g, "\\'");
                
                html += `
                <div class="p-4 border-b border-slate-100 hover:bg-emerald-50 cursor-pointer transition" onclick="selezionaSuggerimentoSpesa('${safeItem}', '${encodedData}')">
                    <p class="font-black text-xs text-slate-800">${item}</p>
                    <div class="mt-2">${fornitoriHTML}</div>
                </div>`;
            }

            if(html) { box.innerHTML = html; box.classList.remove('hidden'); } 
            else { box.classList.add('hidden'); }
        };

        window.selezionaSuggerimentoSpesa = function(nome, fornitoriStr) {
            document.getElementById('manual-shop-item').value = nome;
            document.getElementById('spesa-suggestions').classList.add('hidden');
            let fornitoriDecoded = JSON.parse(decodeURIComponent(fornitoriStr));
            aggiungiVoceManualeSpesaDettagliata(nome, fornitoriDecoded);
        };

        window.aggiungiVoceManualeSpesa = function() {
            let q = document.getElementById('manual-shop-item').value.trim().toUpperCase();
            if(!q) return;

            let fornitoriTrovati = [];
            for (const [fornitore, acquisti] of Object.entries(fornitoriDict)) {
                let match = [...acquisti].reverse().find(a => a.nome_fattura && a.nome_fattura === q);
                if(match) {
                    fornitoriTrovati.push({ fornitore: fornitore, prezzo: parseFloat(match.prezzo_unitario || match.p_unit || 0) });
                }
            }
            
            fornitoriTrovati.sort((a,b) => a.prezzo - b.prezzo);
            aggiungiVoceManualeSpesaDettagliata(q, fornitoriTrovati);
        };

        window.aggiungiVoceManualeSpesaDettagliata = function(nome, fornitori) {
            extraShopping.push({ nome: nome, fornitori: fornitori });
            document.getElementById('manual-shop-item').value = '';
            document.getElementById('spesa-suggestions').classList.add('hidden');
            renderizzaSpesaManuale();
        };

        window.renderizzaSpesaManuale = function() {
            let html = extraShopping.map((item, i) => {
                let fornHTML = '';
                if(item.fornitori && item.fornitori.length > 0) {
                    let tags = item.fornitori.map(f => `
                        <span class="text-[9px] bg-slate-100 px-2 py-1.5 rounded-lg text-slate-700 border border-slate-200">
                            <i class="fas fa-truck text-[8px] mr-1 text-slate-400"></i><b>${f.fornitore}</b> a €${f.prezzo.toFixed(2)}
                        </span>
                    `).join('');
                    fornHTML = `<div class="mt-3 flex flex-wrap gap-1.5">${tags}</div>`;
                }
                
                return `
                <div class="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm relative hover:border-emerald-200 transition">
                    <button onclick="extraShopping.splice(${i},1); renderizzaSpesaManuale();" class="absolute top-3 right-3 text-slate-300 hover:text-red-500 p-2 text-lg transition">
                        <i class="fas fa-times"></i>
                    </button>
                    <span class="text-sm font-black uppercase text-slate-800 pr-8 block">${item.nome}</span>
                    ${fornHTML}
                </div>`;
            }).join('');
            
            document.getElementById('manual-shopping-list').innerHTML = html;
        };

        // ==========================================
        // ELIMINAZIONE MULTIPLA E UTILS
        // ==========================================
        window.toggleAllDivs = function(className) { 
            let chks = document.querySelectorAll('.' + className); 
            let allChecked = Array.from(chks).every(c => c.checked); 
            chks.forEach(c => { c.checked = !allChecked; }); 
            toggleDeleteBulkBtn(className.split('-')[1]); 
        };

        window.toggleDeleteBulkBtn = function(type) { 
            let selected = document.querySelectorAll('.chk-' + type + ':checked').length; 
            let btn = document.getElementById('btn-bulk-' + type); 
            if(btn) { 
                btn.classList.toggle('hidden', selected === 0); 
                let countSpan = document.getElementById('count-' + type); 
                if(countSpan) countSpan.innerText = selected; 
            } 
        };

        window.eliminaSelezionati = async function(tabella, className) { 
            let ids = Array.from(document.querySelectorAll('.' + className + ':checked')).map(c => c.value); 
            if(ids.length === 0) return; 
            
            if(confirm(`Sei sicuro di voler eliminare in blocco ${ids.length} elementi?\nQuesta azione rimuoverà i dati dal Cloud.`)) { 
                await supabaseClient.from(tabella).delete().in('id', ids); 
                if(tabella === 'inventario') await caricaInventarioDaSupabase(); 
                if(tabella === 'finanza') await caricaFinanzaDaSupabase(); 
                if(tabella === 'menu') await caricaMenuCloud(); 
                toggleDeleteBulkBtn(className.split('-')[1]); 
            } 
        };

        // ==========================================
        // GESTIONE CATEGORIE CLOUD
        // ==========================================
        window.caricaCategorieCloud = async function() { 
            const { data } = await supabaseClient.from('categorie').select('*'); 
            
            if(data && data.length > 0) { 
                categorieDB = data.map(c => ({ id: c.id, nome: c.nome })); 
            } else { 
                let defaultCats = ['CANTINA', 'BEVANDE', 'CAFFETTERIA', 'CUCINA', 'PIZZERIA', 'VARIE']; 
                await supabaseClient.from('categorie').insert(defaultCats.map(c => ({nome: c}))); 
                const res = await supabaseClient.from('categorie').select('*'); 
                if(res.data) categorieDB = res.data.map(c => ({ id: c.id, nome: c.nome })); 
            } 
            aggiornaVistaCategorie(); 
        };

        window.aggiornaVistaCategorie = function() { 
            let htmlList = categorieDB.map(c => `
                <div class="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span class="font-black text-sm uppercase text-slate-700">${c.nome}</span>
                    <button onclick="eliminaCategoria('${c.id}')" class="text-red-400 p-2 hover:text-red-600 transition"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
            
            let listCat = document.getElementById('lista-categorie');
            if(listCat) listCat.innerHTML = htmlList;
            
            let htmlOptions = categorieDB.map(c => `<option value="${c.nome.replace(/"/g, '&quot;')}">${c.nome}</option>`).join('');
            
            let selCatMateria = document.getElementById('new-cat'); 
            if(selCatMateria) selCatMateria.innerHTML = htmlOptions;
            
            let selCatRicetta = document.getElementById('piatto-categoria'); 
            if(selCatRicetta) selCatRicetta.innerHTML = htmlOptions;
        };

        window.aggiungiCategoria = async function() { 
            let v = document.getElementById('nuova-cat-input').value.trim().toUpperCase(); 
            if(v && !categorieDB.find(c => c.nome === v)) { 
                await supabaseClient.from('categorie').insert([{ nome: v }]); 
                document.getElementById('nuova-cat-input').value = ''; 
                await caricaCategorieCloud(); 
            } 
        };

        window.eliminaCategoria = async function(id) { 
            if(confirm("Sei sicuro di voler eliminare definitivamente questa categoria dal database cloud?")) { 
                await supabaseClient.from('categorie').delete().eq('id', id); 
                await caricaCategorieCloud(); 
            } 
        };

        window.popolaSelectIngredienti = function() { 
            let sel = document.getElementById('select-ingrediente'); 
            if(sel) {
                let htmlOptions = inventarioLocale.map(i => `
                    <option value="${i.id}" data-nome="${i.nome.replace(/"/g, '&quot;')}">${i.nome} (${i.categoria||'VARIE'})</option>
                `).join(''); 
                sel.innerHTML = htmlOptions;
            }
        };

        // ==========================================
        // FORNITORI, CATALOGHI E STORICO PREZZI MODALE
        // ==========================================
        window.caricaFornitoriCloud = async function() { 
            const { data } = await supabaseClient.from('fornitori_db').select('*').order('nome'); 
            fornitoriDict = {}; 
            
            if(data) {
                data.forEach(f => { fornitoriDict[f.nome] = f.storico || []; }); 
            }
            aggiornaVistaFornitori(); 
        };

        window.salvaStoricoFornitoreCloud = async function(nomeFornitore, storicoArray) { 
            const { data } = await supabaseClient.from('fornitori_db').select('id').eq('nome', nomeFornitore); 
            
            if(data && data.length > 0) { 
                await supabaseClient.from('fornitori_db').update({ storico: storicoArray }).eq('nome', nomeFornitore); 
            } else { 
                await supabaseClient.from('fornitori_db').insert([{ nome: nomeFornitore, storico: storicoArray }]); 
            } 
        };

        window.aggiornaVistaFornitori = function() { 
            let srcInput = document.getElementById('cerca-fornitori');
            let q = srcInput ? srcInput.value.trim().toUpperCase() : '';
            let html = ''; 
            let indiceFornitore = 0;
            
            for (const [nome, acquisti] of Object.entries(fornitoriDict)) {
                indiceFornitore++;
                let totaleSpeso = 0; 
                let prodottiUnici = {}; 
                
                acquisti.forEach(a => {
                    let qta = a.qta || 1; 
                    let p_unit = parseFloat(a.prezzo_unitario || 0);
                    totaleSpeso += (qta * p_unit);
                    
                    if (!prodottiUnici[a.nome_fattura]) prodottiUnici[a.nome_fattura] = [];
                    prodottiUnici[a.nome_fattura].push({ ...a, p_unit: p_unit, qta: qta });
                });
                
                let matchFornitore = nome.includes(q);
                let itemHTML = ''; 
                let elementiMostrati = 0;
                
                let nomiProdotti = Object.keys(prodottiUnici).sort(); 
                
                for (let prod of nomiProdotti) {
                    if (q !== '' && !matchFornitore && !prod.includes(q)) continue; 
                    
                    let storicoProdotto = prodottiUnici[prod];
                    let ultimoAcquisto = storicoProdotto[storicoProdotto.length - 1];
                    let penultimoAcquisto = storicoProdotto.length > 1 ? storicoProdotto[storicoProdotto.length - 2] : null;
                    
                    let p_unit = ultimoAcquisto.p_unit;
                    let varHTML = '';
                    
                    if (penultimoAcquisto) {
                        let diff = p_unit - penultimoAcquisto.p_unit;
                        if(diff > 0) {
                            varHTML = `<span class="text-red-500 ml-2" title="Prezzo Aumentato di €${diff.toFixed(2)}"><i class="fas fa-arrow-trend-up"></i></span>`;
                        } else if (diff < 0) {
                            varHTML = `<span class="text-emerald-500 ml-2" title="Prezzo Diminuito di €${Math.abs(diff).toFixed(2)}"><i class="fas fa-arrow-trend-down"></i></span>`;
                        } else {
                            varHTML = `<span class="text-slate-300 ml-2" title="Prezzo Invariato"><i class="fas fa-equals"></i></span>`;
                        }
                    } else {
                        varHTML = `<span class="text-blue-300 ml-2" title="Primo acquisto storico"><i class="fas fa-star text-[8px]"></i></span>`;
                    }
                    
                    let safeNomeFornitore = nome.replace(/'/g, "\\'");
                    let safeNomeArticolo = prod.replace(/'/g, "\\'");
                    
                    itemHTML += `
                    <div class="flex justify-between items-center text-[11px] font-bold border-b border-slate-100 pb-3 mb-3 hover:bg-slate-50 transition cursor-pointer" onclick="mostraStoricoPrezzi('${safeNomeFornitore}', '${safeNomeArticolo}')" title="Clicca per vedere lo Storico Prezzi">
                        <div class="flex-1 pr-2">
                            <span class="text-slate-600 uppercase leading-tight"><i class="fas fa-box text-[9px] text-slate-300 mr-1"></i> ${prod}</span>
                            <span class="block text-[9px] text-slate-400 font-bold mt-1 tracking-wider">Ultimo Acq: ${ultimoAcquisto.data} (${ultimoAcquisto.qta} ${ultimoAcquisto.um||'PZ'})</span>
                        </div>
                        <div class="text-right flex items-center justify-end w-32 bg-slate-50 p-2 rounded-xl border border-slate-100 shadow-sm hover:bg-slate-200 transition active:scale-95">
                            <span class="text-slate-800 font-black whitespace-nowrap">€ ${p_unit.toFixed(2)}</span>
                            ${varHTML}
                        </div>
                    </div>`;
                    elementiMostrati++;
                }
                
                if (q !== '' && !matchFornitore && elementiMostrati === 0) continue;
                
                let safeNome = nome.replace(/'/g, "\\'");
                let accordionID = `cat-${indiceFornitore}`;
                
                html += `
                <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
                    
                    <div class="flex justify-between items-start border-b border-slate-100 pb-4 pl-3">
                        <div class="flex-1 cursor-pointer" onclick="document.getElementById('${accordionID}').classList.toggle('hidden');">
                            <h4 class="font-black text-base uppercase text-purple-900 tracking-tight flex items-center">
                                ${nome} <i class="fas fa-chevron-down text-[10px] ml-2 text-slate-300"></i>
                            </h4>
                            <p class="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Totale Storico Speso</p>
                            <p class="text-lg font-black text-purple-600">€ ${totaleSpeso.toFixed(2)}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="unisciFornitorePrompt('${safeNome}')" class="text-blue-600 bg-blue-50 w-10 h-10 rounded-xl active:scale-90 flex justify-center items-center shadow-sm" title="Unisci in un altro Fornitore"><i class="fas fa-link"></i></button>
                            <button onclick="eliminaFornitore('${safeNome}')" class="text-red-500 bg-red-50 w-10 h-10 rounded-xl active:scale-90 flex justify-center items-center shadow-sm" title="Elimina Fornitore"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    
                    <div id="${accordionID}" class="mt-4 pl-3 ${q !== '' ? '' : 'hidden'}">
                        <h5 class="text-[10px] font-black text-slate-400 uppercase mb-3 border-b border-slate-100 pb-1">Catalogo Articoli (${elementiMostrati})</h5>
                        ${itemHTML || '<p class="text-[10px] font-bold text-slate-400 uppercase text-center py-4">Nessun articolo per questa ricerca.</p>'}
                    </div>
                </div>`;
            }
            
            let listCont = document.getElementById('fornitori-list-container');
            if(listCont) {
                listCont.innerHTML = html || `
                <div class="text-center p-10 border-2 border-dashed border-slate-200 rounded-3xl mt-4">
                    <i class="fas fa-search text-4xl text-slate-300 mb-3"></i>
                    <p class="text-xs font-bold text-slate-500 uppercase">Nessun Fornitore o Prodotto trovato.</p>
                </div>`; 
            }
        };

        window.mostraStoricoPrezzi = function(fornitore, articolo) {
            document.getElementById('storico-modal-titolo').innerText = articolo;
            document.getElementById('storico-modal-fornitore').innerText = "Fornitore: " + fornitore;

            let storico = fornitoriDict[fornitore];
            if (!storico) return;

            let acquistiArticolo = storico.filter(a => a.nome_fattura === articolo);
            let htmlList = '';
            
            let acquistiReverse = [...acquistiArticolo].reverse();

            acquistiReverse.forEach((a, idx) => {
                let p = parseFloat(a.prezzo_unitario || 0);
                let varSpan = '';
                
                if (idx < acquistiReverse.length - 1) {
                    let oldP = parseFloat(acquistiReverse[idx + 1].prezzo_unitario || 0);
                    let diff = p - oldP;
                    
                    if (diff > 0) {
                        varSpan = `<span class="text-red-500 font-black text-[10px] ml-2 bg-red-50 px-2 py-1 rounded-md border border-red-100">+€${diff.toFixed(2)} <i class="fas fa-arrow-up"></i></span>`;
                    } else if (diff < 0) {
                        varSpan = `<span class="text-emerald-500 font-black text-[10px] ml-2 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">-€${Math.abs(diff).toFixed(2)} <i class="fas fa-arrow-down"></i></span>`;
                    } else {
                        varSpan = `<span class="text-slate-400 font-black text-[10px] ml-2 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">INVARIATO <i class="fas fa-equals"></i></span>`;
                    }
                } else {
                    varSpan = `<span class="text-blue-500 font-black text-[10px] ml-2 bg-blue-50 px-2 py-1 rounded-md border border-blue-100"><i class="fas fa-star mr-1"></i> Prezzo Base</span>`;
                }

                htmlList += `
                <div class="flex justify-between items-center p-4 border border-slate-200 rounded-2xl bg-white shadow-sm hover:border-emerald-200 transition">
                    <div class="flex items-center gap-3">
                        <div class="bg-slate-100 w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 border border-slate-200">
                            <i class="fas fa-calendar-day"></i>
                        </div>
                        <div>
                            <p class="font-black text-sm text-slate-800">${a.data}</p>
                            <p class="text-[9px] font-bold text-slate-400 uppercase mt-1">Acquistati: ${a.qta || 1} ${a.um || 'PZ'}</p>
                        </div>
                    </div>
                    <div class="text-right flex flex-col items-end gap-1">
                        <p class="font-black text-base text-slate-800">€ ${p.toFixed(2)}</p>
                        ${varSpan}
                    </div>
                </div>`;
            });

            document.getElementById('storico-modal-lista').innerHTML = htmlList;
            document.getElementById('modal-storico-prezzi').classList.remove('hidden');
        };

        window.chiudiStoricoPrezzi = function() {
            document.getElementById('modal-storico-prezzi').classList.add('hidden');
        };

        window.unisciFornitorePrompt = async function(sorgente) {
            let options = Object.keys(fornitoriDict).filter(k => k !== sorgente).join('\n- ');
            
            if(!options) { return alert("Non ci sono altri fornitori nel database con cui unire questo."); }
            
            let destinazione = prompt(`VUOI UNIRE "${sorgente}" IN UN ALTRO FORNITORE?\n\nCopia e scrivi qui sotto il NOME ESATTO del fornitore di destinazione tra questi:\n\n- ${options}`);
            
            if(!destinazione) return;
            destinazione = destinazione.trim().toUpperCase();
            
            if(!fornitoriDict[destinazione]) { return alert("Fornitore non trovato. Devi scrivere il nome esattamente come appare nella lista, rispettando gli spazi."); }
            
            if(confirm(`ATTENZIONE CRITICA:\nSei sicuro di voler unire interamente "${sorgente}" dentro "${destinazione}"?\n\nTutto lo storico, i prezzi e le fatture verranno uniti. L'operazione NON PUÒ ESSERE ANNULLATA.`)) {
                
                let storicoUnito = [...fornitoriDict[destinazione], ...fornitoriDict[sorgente]];
                
                await supabaseClient.from('fornitori_db').update({ storico: storicoUnito }).eq('nome', destinazione);
                await supabaseClient.from('fornitori_db').delete().eq('nome', sorgente);
                
                const { data: movs } = await supabaseClient.from('finanza').select('*').eq('categoria', 'Fornitori').ilike('descrizione', `%FATTURA: ${sorgente}%`);
                
                if(movs && movs.length > 0) {
                    for(let m of movs) {
                        let newDesc = m.descrizione.replace(`FATTURA: ${sorgente}`, `FATTURA: ${destinazione}`);
                        await supabaseClient.from('finanza').update({ descrizione: newDesc }).eq('id', m.id);
                    }
                }
                
                alert("Fusione completata con successo!");
                await caricaFornitoriCloud();
                await caricaFinanzaDaSupabase();
            }
        };

        window.aggiungiFornitoreManuale = async function() { 
            let n = document.getElementById('new-fornitore-name').value.trim().toUpperCase(); 
            if(n && !fornitoriDict[n]) { 
                await salvaStoricoFornitoreCloud(n, []); 
                document.getElementById('new-fornitore-name').value = ''; 
                await caricaFornitoriCloud(); 
            } 
        };

        window.eliminaFornitore = async function(n) { 
            if(confirm(`Sei sicuro di voler eliminare tutto lo storico di ${n} dal cloud?`)) { 
                await supabaseClient.from('fornitori_db').delete().eq('nome', n); 
                await caricaFornitoriCloud(); 
            } 
        };

        // ==========================================
        // MENU E RICETTE (FOOD COST)
        // ==========================================
        window.caricaMenuCloud = async function() { 
            const { data } = await supabaseClient.from('menu').select('*').order('categoria').order('nome'); 
            menuRistorante = data || []; 
            aggiornaVistaRicettario(); 
        };

        window.aggiornaVistaRicettario = function() { 
            let html = ''; 
            let cats = [...new Set(menuRistorante.map(i => i.categoria || 'GENERALE'))]; 
            
            cats.forEach(c => { 
                html += `
                <div class="bg-blue-100 p-2 mt-5 rounded-lg border border-blue-200 flex items-center">
                    <span class="font-black text-[10px] uppercase text-blue-800 ml-2 tracking-widest">${c}</span>
                </div>`; 
                
                let piattiFiltrati = menuRistorante.filter(m => (m.categoria || 'GENERALE') === c);
                
                piattiFiltrati.forEach((p) => { 
                    let nIng = p.ingredienti ? p.ingredienti.length : 0;
                    
                    html += `
                    <div class="bg-white p-5 border-2 border-slate-100 rounded-2xl flex justify-between mt-2 items-center shadow-sm hover:border-blue-200 transition cursor-pointer">
                        <input type="checkbox" class="chk-menu w-5 h-5 accent-blue-600 mr-4 cursor-pointer" value="${p.id}" onchange="toggleDeleteBulkBtn('menu')">
                        <div class="flex-1" onclick="modificaPiattoEsistente('${p.id}')">
                            <p class="font-black text-sm uppercase text-slate-800">${p.nome}</p>
                            <p class="text-[9px] font-bold ${nIng > 0 ? 'text-blue-500' : 'text-amber-500'} uppercase mt-1">
                                <i class="fas fa-link mr-1"></i> ${nIng} Associazione/i Magazzino
                            </p>
                        </div>
                    </div>`; 
                }); 
            }); 
            
            let listMenu = document.getElementById('menu-builder-list');
            if(listMenu) {
                listMenu.innerHTML = html || `
                <div class="text-center p-10 border-2 border-dashed border-slate-200 rounded-3xl mt-4">
                    <i class="fas fa-book-open text-4xl text-slate-300 mb-3"></i>
                    <p class="text-xs font-bold text-slate-500 uppercase">Nessuna regola di scarico creata</p>
                </div>`; 
            }
            toggleDeleteBulkBtn('menu'); 
        };

        window.salvaPiattoMenu = async function() { 
            let n = document.getElementById('piatto-nome').value.toUpperCase().trim(); 
            let c = document.getElementById('piatto-categoria').value.toUpperCase().trim() || 'GENERALE'; 
            let idMod = document.getElementById('piatto-id-modifica').value; 
            
            if(!n) return alert("Inserisci il nome del tasto di cassa."); 
            
            if(idMod) { 
                await supabaseClient.from('menu').update({ 
                    nome: n, categoria: c, ingredienti: ingredientiTempRicetta 
                }).eq('id', idMod); 
            } else { 
                let ex = menuRistorante.find(m => m.nome === n); 
                if(ex) {
                    await supabaseClient.from('menu').update({ ingredienti: ingredientiTempRicetta, categoria: c }).eq('id', ex.id); 
                } else {
                    await supabaseClient.from('menu').insert([{ 
                        nome: n, categoria: c, prezzo: 0, ingredienti: ingredientiTempRicetta 
                    }]); 
                }
            } 
            
            chiudiCreaPiatto(); 
            await caricaMenuCloud(); 
        };

        window.apriCreaPiatto = function() { 
            document.getElementById('form-crea-piatto').classList.remove('hidden'); 
            ingredientiTempRicetta = []; 
            document.getElementById('lista-ingredienti-piatto').innerHTML = ''; 
            document.getElementById('piatto-id-modifica').value = ''; 
            document.getElementById('piatto-nome').value = ''; 
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        };

        window.chiudiCreaPiatto = function() { 
            document.getElementById('form-crea-piatto').classList.add('hidden'); 
        };

        window.modificaPiattoEsistente = function(id) { 
            let p = menuRistorante.find(x => x.id === id); 
            
            document.getElementById('piatto-id-modifica').value = p.id; 
            document.getElementById('piatto-nome').value = p.nome; 
            document.getElementById('piatto-categoria').value = p.categoria || ''; 
            
            ingredientiTempRicetta = p.ingredienti ? [...p.ingredienti] : []; 
            disegnaIngredientiTempRicetta();
            
            document.getElementById('form-crea-piatto').classList.remove('hidden'); 
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        };

        window.rimuoviIngredienteRicetta = function(idx) {
            ingredientiTempRicetta.splice(idx, 1);
            disegnaIngredientiTempRicetta();
        };

        window.aggiungiIngredienteRicetta = function() { 
            const sel = document.getElementById('select-ingrediente'); 
            const qtaInput = document.getElementById('qta-ingrediente').value;
            let val = parseFloat(qtaInput);
            
            if(isNaN(val) || val <= 0) return alert("Inserisci una dose valida in decimali (es. 0.25).");
            
            ingredientiTempRicetta.push({ 
                id_supa: sel.value, 
                nome: sel.options[sel.selectedIndex].getAttribute('data-nome'), 
                qta: val 
            }); 
            
            document.getElementById('qta-ingrediente').value = '';
            disegnaIngredientiTempRicetta();
        };

        window.disegnaIngredientiTempRicetta = function() {
            let htmlIng = ingredientiTempRicetta.map((x, i) => `
                <div class='flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 mb-2 shadow-sm'>
                    <span class="text-[10px] font-black uppercase text-slate-700">${x.nome}</span>
                    <div class="flex items-center">
                        <span class="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">${x.qta} dose</span>
                        <button onclick='rimuoviIngredienteRicetta(${i})' class='text-red-400 bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center ml-2 hover:bg-red-100 transition border border-red-100'><i class='fas fa-times'></i></button>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('lista-ingredienti-piatto').innerHTML = htmlIng;
        };

        window.suggerisciGrammatura = function() { 
            let n = document.getElementById('piatto-nome').value.toUpperCase(); 
            let q = document.getElementById('qta-ingrediente'); 
            
            if (n.includes('CAFFE') || n.includes('ESPRESSO') || n.includes('MACCHIATO')) { 
                q.value = n.includes('DOPPIO') ? '0.014' : '0.007'; 
            } else if (n.includes('1/2') || n.includes('MEZZO')) { 
                q.value = '0.5'; 
            } else if (n.includes('CALICE')) { 
                q.value = '0.15'; 
            } else if (n.includes('1/4') || n.includes('QUARTO')) {
                q.value = '0.25';
            }
        };

        // ==========================================
        // BILANCIO, MODIFICA DATA E MODIFICA IMPORTO
        // ==========================================
        window.caricaFinanzaDaSupabase = async function() { 
            const { data } = await supabaseClient.from('finanza').select('*').order('data', { ascending: false }); 
            finanzaDatiGlobali = data || []; 
            renderFinanzaList(); 
        };

        window.setFinanzaTab = function(tab) { 
            currentFinanzaTab = tab; 
            ['TUTTE', 'ENTRATE', 'PAGATE', 'DA_PAGARE'].forEach(t => { 
                let btn = document.getElementById('tab-' + t); 
                if(t === tab) { 
                    btn.className = "flex-1 py-3 text-[10px] font-black uppercase rounded-xl bg-white shadow-md text-slate-800 transition scale-105 z-10 border border-slate-200"; 
                } else { 
                    btn.className = "flex-1 py-3 text-[10px] font-black uppercase rounded-xl text-slate-400 transition hover:bg-slate-200 border border-transparent"; 
                } 
            }); 
            renderFinanzaList(); 
        };
        
        window.cambiaStatoPagamento = async function(id, statoAttuale) {
            let nuovoStato = statoAttuale === 'pagato' ? 'da_pagare' : 'pagato';
            let msg = nuovoStato === 'pagato' ? "Confermi di aver SALDATO e pagato questa spesa?" : "Vuoi annullare il pagamento e far tornare questa fattura nei DEBITI DA PAGARE?";
            
            if(confirm(msg)) {
                let dataPag = nuovoStato === 'pagato' ? new Date().toISOString() : null;
                await supabaseClient.from('finanza').update({ stato_pagamento: nuovoStato, data_pagamento: dataPag }).eq('id', id);
                await caricaFinanzaDaSupabase(); 
            }
        };

        window.modificaDataMovimento = async function(id, dataAttualeIso) { 
            let oldDate = dataAttualeIso ? dataAttualeIso.substring(0, 10) : new Date().toISOString().substring(0,10);
            let nuovaData = prompt("MODIFICA DATA FISCALE / PAGAMENTO\nQuesto cambierà il mese in cui il movimento farà bilancio.\n(Formato: AAAA-MM-GG):", oldDate); 
            
            if (nuovaData !== null && nuovaData.trim() !== "") { 
                if (/^\d{4}-\d{2}-\d{2}$/.test(nuovaData.trim())) {
                    let isoData = new Date(nuovaData.trim() + "T12:00:00.000Z").toISOString();
                    await supabaseClient.from('finanza').update({ data: isoData, data_pagamento: isoData }).eq('id', id); 
                    caricaFinanzaDaSupabase(); 
                } else {
                    alert("Formato Data Errato. Usa l'anno, trattino, mese, trattino, giorno (Es. 2026-06-25)");
                }
            } 
        };

        window.modificaImportoMovimento = async function(id, oldImporto) {
            let nuovoImporto = prompt("MODIFICA IMPORTO\nInserisci il nuovo importo totale della fattura o incasso (€):", oldImporto);
            
            if (nuovoImporto !== null && nuovoImporto.trim() !== "") {
                let parsed = parseFloat(nuovoImporto.replace(',', '.'));
                if (!isNaN(parsed)) {
                    await supabaseClient.from('finanza').update({ importo: parsed }).eq('id', id);
                    await caricaFinanzaDaSupabase();
                } else {
                    alert("Errore: Hai inserito un formato numerico non valido.");
                }
            }
        };

        window.renderFinanzaList = function() {
            let meseSel = document.getElementById('finanza-mese-selettore');
            if(!meseSel) return;
            
            let mese = meseSel.value; 
            let testo = document.getElementById('finanza-filtro-testo').value.toLowerCase(); 
            let filtratiMese = finanzaDatiGlobali.filter(m => m.data && m.data.startsWith(mese));
            
            let totE = 0; let totUPag = 0; let totDeb = 0; let ivaD = 0; let ivaC = 0;
            
            filtratiMese.forEach(m => { 
                let isE = (m.tipo === 'entrata'); 
                if(isE) { totE += m.importo; ivaD += (m.iva || 0); } 
                else { 
                    if(m.stato_pagamento === 'pagato') { totUPag += m.importo; ivaC += (m.iva || 0); } 
                    else { totDeb += m.importo; ivaC += (m.iva || 0); } 
                } 
            });
            
            let liq = totE - totUPag; 
            
            document.getElementById('finanza-saldo').innerText = '€ ' + Math.abs(liq).toLocaleString('it-IT', {minimumFractionDigits:2, maximumFractionDigits:2}); 
            document.getElementById('finanza-saldo').className = `text-5xl font-black my-2 tracking-tighter ${liq >= 0 ? 'text-emerald-400' : 'text-red-400'}`; 
            document.getElementById('finanza-saldo-segno').innerText = liq >= 0 ? "ATTIVO MENSILE (UTILE)" : "PASSIVO MENSILE (PERDITA)"; 
            document.getElementById('finanza-saldo-segno').className = `inline-block text-[10px] font-black uppercase px-4 py-1.5 rounded-full mb-1 border ${liq >= 0 ? 'bg-emerald-900 border-emerald-500 text-emerald-400' : 'bg-red-900 border-red-500 text-red-400'}`; 
            
            document.getElementById('finanza-iva-totale').innerText = '€ ' + Math.abs(ivaD - ivaC).toLocaleString('it-IT', {minimumFractionDigits:2}); 
            document.getElementById('finanza-iva-badge').innerText = (ivaD - ivaC) >= 0 ? "DA VERSARE F24" : "A CREDITO"; 
            document.getElementById('finanza-iva-badge').className = `text-[9px] font-black uppercase px-3 py-1.5 rounded ${ (ivaD - ivaC) >= 0 ? 'bg-red-500 text-white shadow-md shadow-red-500/50' : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/50' }`; 
            
            document.getElementById('finanza-entrate').innerText = '€ ' + totE.toLocaleString('it-IT', {minimumFractionDigits:2}); 
            document.getElementById('finanza-uscite-pagate').innerText = '€ ' + totUPag.toLocaleString('it-IT', {minimumFractionDigits:2}); 
            document.getElementById('finanza-debiti').innerText = '€ ' + totDeb.toLocaleString('it-IT', {minimumFractionDigits:2}); 
            document.getElementById('dash-income').innerText = '€ ' + totE.toLocaleString('it-IT', {minimumFractionDigits:2});
            
            let viewList = filtratiMese.filter(m => { 
                let desc = (m.descrizione||'').toLowerCase(); let cat = (m.categoria||'').toLowerCase(); 
                if (testo !== "" && !desc.includes(testo) && !cat.includes(testo)) return false; 
                if (currentFinanzaTab === 'ENTRATE') return m.tipo === 'entrata'; 
                if (currentFinanzaTab === 'PAGATE') return m.tipo === 'uscita' && m.stato_pagamento === 'pagato'; 
                if (currentFinanzaTab === 'DA_PAGARE') return m.tipo === 'uscita' && m.stato_pagamento === 'da_pagare'; 
                return true; 
            });
            
            let htmlList = viewList.map(m => { 
                let isE = (m.tipo === 'entrata'); 
                let badge = '';
                
                if (m.stato_pagamento === 'da_pagare') {
                    badge = `<button onclick="cambiaStatoPagamento('${m.id}', '${m.stato_pagamento}')" class="bg-red-500 text-white status-badge ml-2 border border-red-600 shadow-sm animate-pulse">DA PAGARE</button>`;
                } else if (isE) {
                    badge = `<span class="bg-emerald-100 text-emerald-700 status-badge ml-2 border border-emerald-200">INCASSO</span>`;
                } else {
                    badge = `<button onclick="cambiaStatoPagamento('${m.id}', '${m.stato_pagamento}')" class="bg-slate-200 text-slate-600 status-badge ml-2 border border-slate-300 shadow-sm hover:bg-slate-300">PAGATO</button>`;
                }
                
                let dataStr = new Date(m.data).toLocaleDateString('it-IT'); 
                let descJS = (m.descrizione||'').replace(/'/g, "\\'"); 
                
                return `
                <div class="p-4 flex justify-between items-center bg-white hover:bg-slate-50 transition border-b border-slate-100">
                    <input type="checkbox" class="chk-finanza w-5 h-5 accent-emerald-600 mr-4 cursor-pointer" value="${m.id}" onchange="toggleDeleteBulkBtn('finanza')">
                    
                    <div class="flex-1 mr-2 overflow-hidden">
                        <p class="font-black text-xs uppercase text-slate-800 truncate">${m.descrizione}</p>
                        <div class="flex items-center mt-1">
                            <i class="fas fa-calendar-alt text-[9px] text-slate-300 mr-1"></i>
                            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${dataStr} ${badge}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center">
                        <div class="flex items-center">
                            <span class="font-black text-base ${isE ? 'text-emerald-500' : 'text-slate-700'} whitespace-nowrap tracking-tight">€ ${m.importo.toLocaleString('it-IT', {minimumFractionDigits:2})}</span>
                            <button onclick="modificaImportoMovimento('${m.id}', ${m.importo})" class="text-slate-400 hover:text-emerald-600 p-2 transition ml-1" title="Modifica Importo">
                                <i class="fas fa-edit text-xs"></i>
                            </button>
                        </div>
                        
                        <div class="flex flex-col ml-1 gap-1 border-l border-slate-200 pl-2">
                            <button onclick="modificaDataMovimento('${m.id}', '${m.data}')" class="text-amber-500 bg-amber-50 w-7 h-7 rounded-md active:scale-90 flex items-center justify-center border border-amber-200" title="Sposta Mese / Modifica Data">
                                <i class="fas fa-calendar-day text-[10px]"></i>
                            </button>
                            <button onclick="rinominaMovimentoFinanza('${m.id}', '${descJS}')" class="text-blue-500 bg-blue-50 w-7 h-7 rounded-md active:scale-90 flex items-center justify-center border border-blue-200" title="Modifica Descrizione">
                                <i class="fas fa-pencil text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                </div>`; 
            }).join('');
            
            let finanzaListCont = document.getElementById('finanza-list');
            if(finanzaListCont) {
                finanzaListCont.innerHTML = htmlList || `
                <div class="text-center py-12">
                    <i class="fas fa-receipt text-5xl text-slate-200 mb-3"></i>
                    <p class="text-xs text-slate-400 font-bold uppercase">Nessun Movimento Registrato</p>
                </div>`;
            }
            toggleDeleteBulkBtn('finanza');
        };

        window.rinominaMovimentoFinanza = async function(id, oldName) { 
            let newName = prompt("Modifica intestatario o descrizione della spesa/incasso:", oldName); 
            if (newName !== null && newName.trim() !== "") { 
                await supabaseClient.from('finanza').update({ descrizione: newName.trim().toUpperCase() }).eq('id', id); 
                caricaFinanzaDaSupabase(); 
            } 
        };

        window.apriMovimentoManuale = function() { 
            document.getElementById('form-movimento-manuale').classList.remove('hidden'); 
            document.getElementById('man-desc').value = ''; 
            document.getElementById('man-importo').value = ''; 
            document.getElementById('man-iva').value = '0.00'; 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        };

        window.chiudiMovimentoManuale = function() { 
            document.getElementById('form-movimento-manuale').classList.add('hidden'); 
        };

        window.salvaMovimentoManuale = async function() { 
            let desc = document.getElementById('man-desc').value.trim().toUpperCase(); 
            let imp = parseFloat(document.getElementById('man-importo').value); 
            let iva = parseFloat(document.getElementById('man-iva').value) || 0; 
            let dataSelezionata = document.getElementById('man-data').value; 
            let tipo = document.getElementById('man-tipo').value; 
            let stato = document.getElementById('man-stato').value; 
            
            if(!desc || isNaN(imp) || !dataSelezionata) return alert("Attenzione: Compila descrizione, importo e data per poter salvare in bilancio."); 
            
            let isoData = new Date(dataSelezionata + "T12:00:00.000Z").toISOString(); 
            await supabaseClient.from('finanza').insert([{ 
                tipo: tipo, categoria: (tipo==='entrata' ? 'Ristorante' : 'Varie'), 
                descrizione: desc, importo: imp, iva: iva, stato_pagamento: stato, 
                data: isoData, data_pagamento: (stato==='pagato' ? isoData : null) 
            }]); 
            
            chiudiMovimentoManuale(); 
            caricaFinanzaDaSupabase(); 
        };

        // ==========================================
        // LETTORE FATTURE XML (A.I. Intelligente)
        // ==========================================
        window.elaboraFatturaXML = function(input) {
            if(!input.files[0]) return; 
            document.getElementById('fattura-loader').classList.remove('hidden'); 
            document.getElementById('fattura-result').classList.add('hidden');
            const reader = new FileReader(); 
            
            reader.onload = function(e) {
                try {
                    let rawText = e.target.result; 
                    let items = []; let ivaT = 0; let extractedFornitore = ""; 
                    let extractedDataDoc = new Date().toISOString().substring(0, 10);
                    
                    let matchDenom = rawText.match(/<CedentePrestatore>[\s\S]*?<Denominazione>(.*?)<\/Denominazione>/i); 
                    if (matchDenom) {
                        extractedFornitore = matchDenom[1].trim().toUpperCase(); 
                    } else { 
                        let matchHtml = rawText.match(/Cedente \/ Prestatore[\s\S]*?<b>(.*?)<\/b>/i); 
                        if (matchHtml) extractedFornitore = matchHtml[1].trim().toUpperCase(); 
                    }
                    
                    if (rawText.includes('<html')) {
                        let dataMatch = rawText.match(/(\d{2})\/(\d{2})\/(\d{4})/); 
                        if(dataMatch) extractedDataDoc = `${dataMatch[3]}-${dataMatch[2]}-${dataMatch[1]}`;
                        
                        const parser = new DOMParser(); 
                        const htmlDoc = parser.parseFromString(rawText, "text/html"); 
                        const tabelle = htmlDoc.querySelectorAll('table'); let tabellaP = null;
                        
                        for (let tb of tabelle) { if (tb.textContent.includes('Prezzo unitario') || tb.textContent.includes('Prezzo Unitario')) { tabellaP = tb; break; } }
                        
                        if (tabellaP) { 
                            tabellaP.querySelectorAll('tbody tr').forEach(riga => { 
                                const celle = riga.querySelectorAll('td'); 
                                if (celle.length >= 7) { 
                                    let desc = celle[1].innerText.split('Periodo')[0].trim(); 
                                    let qta = parseFloat(celle[2].innerText.replace(/\./g,'').replace(',','.'))||0; 
                                    let p = parseFloat(celle[3].innerText.replace(/\./g,'').replace(',','.'))||0; 
                                    let percIva = parseFloat(celle[6].innerText.replace(',','.'))||0; 
                                    let um = celle[4] ? celle[4].innerText.trim().toUpperCase() : "PZ"; 
                                    if(um === "") um = "PZ";
                                    
                                    if (desc && qta > 0) { 
                                        items.push({ nome: desc.substring(0,50), qta: qta, um: um.substring(0,5), costo_unit: p }); 
                                        ivaT += (qta * p) * (percIva / 100); 
                                    } 
                                } 
                            }); 
                        }
                    } else {
                        let estrazione = rawText.match(/(<[a-zA-Z0-9_:]*FatturaElettronica[\s\S]*<\/[a-zA-Z0-9_:]*FatturaElettronica>)/i); 
                        if(estrazione) rawText = estrazione[1];
                        
                        const parser = new DOMParser(); 
                        const xmlDoc = parser.parseFromString(rawText, "text/xml"); 
                        const getTags = (nodo, n) => { let t = nodo.getElementsByTagName(n); return t.length === 0 ? nodo.getElementsByTagNameNS("*", n) : t; };
                        
                        let dataTag = getTags(xmlDoc.documentElement, "Data")[0]; 
                        if(dataTag && dataTag.textContent) extractedDataDoc = dataTag.textContent.substring(0,10);
                        
                        const linee = getTags(xmlDoc.documentElement, "DettaglioLinee");
                        for(let i=0; i < linee.length; i++) { 
                            let tagDesc = getTags(linee[i], "Descrizione")[0];
                            let tagQta = getTags(linee[i], "Quantita")[0];
                            let tagPrezzo = getTags(linee[i], "PrezzoUnitario")[0];
                            let tagIva = getTags(linee[i], "AliquotaIVA")[0];
                            let tagUM = getTags(linee[i], "UnitaMisura")[0]; 
                            
                            let um = tagUM && tagUM.textContent ? tagUM.textContent.trim().toUpperCase() : "PZ"; 
                            if(tagDesc && tagPrezzo) { 
                                let q = tagQta ? parseFloat(tagQta.textContent) : 1; 
                                let p = parseFloat(tagPrezzo.textContent); 
                                let perc = tagIva ? parseFloat(tagIva.textContent) : 0; 
                                ivaT += (q * p) * (perc / 100); 
                                items.push({ nome: tagDesc.textContent.trim().substring(0,50), qta: q, um: um.substring(0,5), costo_unit: p }); 
                            } 
                        }
                    }
                    
                    fatturaItemsLetti = items; 
                    document.getElementById('ocr-tot-iva').value = ivaT.toFixed(2); 
                    document.getElementById('ocr-data-doc').value = extractedDataDoc;
                    
                    impostaFornitoreUI(extractedFornitore);
                    
                    let htmlItems = items.map((i, idx) => {
                        let nomeUpper = i.nome.toUpperCase();
                        let exactMatch = inventarioLocale.find(inv => inv.nome === nomeUpper);
                        let defaultSelect = exactMatch ? exactMatch.id : 'NEW';
                        
                        let opts = inventarioLocale.map(inv => `<option value="${inv.id}" ${inv.id === defaultSelect ? 'selected' : ''}>${inv.nome} (${inv.categoria||'VARIE'})</option>`).join('');
                        
                        return `
                        <div class="p-4 border-b border-slate-100 hover:bg-slate-50 transition">
                            <div class="flex justify-between text-[11px] font-black uppercase mb-2">
                                <span class="text-slate-800">${i.nome} <span class="bg-slate-200 px-1 rounded text-slate-600 ml-1">x${i.qta} ${i.um}</span></span>
                                <span class="text-emerald-600 bg-emerald-50 px-2 rounded">€${i.costo_unit.toFixed(2)} / ${i.um}</span>
                            </div>
                            <select id="map-fattura-${idx}" class="w-full border-2 border-slate-200 p-2 rounded-xl text-[10px] font-bold ${exactMatch ? 'bg-emerald-100 border-emerald-300' : 'bg-amber-50 border-amber-200'} outline-none focus:border-slate-500 transition">
                                <option value="NEW">+ CREA COME NUOVA MATERIA IN MAGAZZINO</option>
                                <optgroup label="Materie in Magazzino">${opts}</optgroup>
                            </select>
                        </div>`;
                    }).join('');
                    
                    document.getElementById('fattura-items-list').innerHTML = htmlItems || '<p class="p-4 text-xs text-center text-slate-400 font-bold uppercase">Nessuna voce estraibile trovata in fattura.</p>';
                    document.getElementById('fattura-loader').classList.add('hidden'); 
                    document.getElementById('fattura-result').classList.remove('hidden');
                    
                } catch(err) { 
                    alert("Ops! L'A.I. non è riuscita a leggere questo file XML/HTML.\nPossibile tracciato corrotto o formato non supportato da SDI."); 
                    document.getElementById('fattura-loader').classList.add('hidden'); 
                }
            }; 
            reader.readAsText(input.files[0]);
        };

        window.impostaFornitoreUI = function(name) {
            let sel = document.getElementById('fattura-fornitore-select'); 
            let customInput = document.getElementById('fattura-fornitore-custom');
            let opts = `<option value="NUOVO" class="font-black text-emerald-600">--- 📝 INSERISCI NUOVO FORNITORE ---</option>`;
            
            opts += Object.keys(fornitoriDict).map(f => `<option value="${f}">${f}</option>`).join('');
            sel.innerHTML = opts;
            
            if (name && Object.keys(fornitoriDict).includes(name)) { 
                sel.value = name; customInput.classList.add('hidden'); 
            } else { 
                sel.value = 'NUOVO'; customInput.value = name || ""; customInput.classList.remove('hidden'); 
            }
        };

        window.checkFornitoreCustom = function() { 
            let sel = document.getElementById('fattura-fornitore-select');
            document.getElementById('fattura-fornitore-custom').classList.toggle('hidden', sel.value !== 'NUOVO'); 
        };

        window.confermaCaricoFattura = async function() {
            let selVal = document.getElementById('fattura-fornitore-select').value; 
            let fornitore = selVal === 'NUOVO' ? document.getElementById('fattura-fornitore-custom').value.trim().toUpperCase() : selVal;
            let doc = document.getElementById('ocr-tipo-doc').value; 
            let stato = document.getElementById('ocr-stato-pag').value;
            let tot = 0; 
            let ivaE = parseFloat(document.getElementById('ocr-tot-iva').value) || 0;
            let dataFattura = document.getElementById('ocr-data-doc').value; 
            
            if(!dataFattura) dataFattura = new Date().toISOString().substring(0,10); 
            let isoData = new Date(dataFattura + "T12:00:00.000Z").toISOString();
            
            if(!fornitore) return alert("Inserisci il nome del fornitore prima di procedere."); 
            if(!fornitoriDict[fornitore]) fornitoriDict[fornitore] = [];

            event.currentTarget.innerText = "Salvataggio in corso...";
            event.currentTarget.disabled = true;

            for(let i=0; i < fatturaItemsLetti.length; i++) {
                let item = fatturaItemsLetti[i]; 
                tot += (item.qta * item.costo_unit);
                
                if(doc === 'merce') {
                    let mapScelta = document.getElementById(`map-fattura-${i}`).value; 
                    let idAss = null; 
                    let nomeAss = item.nome;
                    
                    if(mapScelta === 'NEW') { 
                        let existing = inventarioLocale.find(p => p.nome === item.nome.toUpperCase());
                        if (existing) {
                            idAss = existing.id; nomeAss = existing.nome;
                            await supabaseClient.from('inventario').update({ quantita: parseFloat(existing.quantita) + item.qta, prezzo: item.costo_unit }).eq('id', idAss);
                        } else {
                            const { data } = await supabaseClient.from('inventario').insert([{ nome: item.nome.toUpperCase(), quantita: item.qta, prezzo: item.costo_unit, categoria: 'VARIE' }]).select(); 
                            if(data) idAss = data[0].id; 
                        }
                    } else { 
                        idAss = mapScelta; 
                        let p = inventarioLocale.find(x => x.id === mapScelta); 
                        if(p) { 
                            nomeAss = p.nome; 
                            await supabaseClient.from('inventario').update({ quantita: parseFloat(p.quantita) + item.qta, prezzo: item.costo_unit }).eq('id', idAss); 
                        } 
                    }
                    
                    fornitoriDict[fornitore].push({ nome_fattura: item.nome, padre_magazzino: nomeAss, qta: item.qta, um: item.um, prezzo_unitario: item.costo_unit, data: new Date(dataFattura).toLocaleDateString('it-IT') });
                }
            }
            
            await salvaStoricoFornitoreCloud(fornitore, fornitoriDict[fornitore]);
            
            await supabaseClient.from('finanza').insert([{ 
                tipo: 'uscita', categoria: 'Fornitori', descrizione: `FATTURA: ${fornitore}`, 
                importo: tot + ivaE, iva: ivaE, stato_pagamento: stato, data: isoData, data_pagamento: stato === 'pagato' ? isoData : null 
            }]);
            
            alert("Fattura Registrata in Cloud!"); 
            nav('view-dashboard'); 
            document.getElementById('file-xml').value = '';
            
            await caricaInventarioDaSupabase(); 
            await caricaFornitoriCloud();
        };

        // ==========================================
        // SINCRO RCH
        // ==========================================
        window.elaboraVenditeRCHExcel = function(input) {
            if(!input.files[0]) return; 
            const reader = new FileReader(); 
            
            reader.onload = async function(e) {
                try {
                    const data = new Uint8Array(e.target.result); 
                    const workbook = XLSX.read(data, {type: 'array'});
                    let sheetProdottiName = workbook.SheetNames.find(n => String(n).toLowerCase().includes('venduto prodotti'));
                    let sheetIvaName = workbook.SheetNames.find(n => String(n).toLowerCase().includes('iva'));
                    
                    if(!sheetProdottiName) { alert("File RCH Errato! Assicurati di scaricare il report 'Venduto Prodotti'."); input.value = ''; return; }

                    let lordo = 0; let iva = 0;
                    if(sheetIvaName) {
                        const jsonIva = XLSX.utils.sheet_to_json(workbook.Sheets[sheetIvaName], {header: 1});
                        if(jsonIva[1]) { 
                            lordo = parseFloat(String(jsonIva[1][6]||'0').replace(/\./g, '').replace(',', '.')) || 0; 
                            iva = parseFloat(String(jsonIva[1][5]||'0').replace(/\./g, '').replace(',', '.')) || 0; 
                        }
                    }
                    
                    const fileID = `RCH_${lordo}_${input.files[0].lastModified}`;
                    const { data: exists } = await supabaseClient.from('finanza').select('id').eq('descrizione', fileID);
                    if(exists && exists.length > 0) { alert("File cassa già caricato in bilancio. Operazione annullata."); input.value = ''; return; }

                    const jsonProd = XLSX.utils.sheet_to_json(workbook.Sheets[sheetProdottiName], {header: 1});
                    let daScaricare = {}; let nuoviPiatti = [];
                    
                    for(let i=1; i<jsonProd.length; i++) {
                        let row = jsonProd[i]; 
                        if(row && row[0]) {
                            let nome = String(row[0]).trim().toUpperCase(); 
                            let qta = parseFloat(String(row[2]).replace(',', '.')) || 0; 
                            let cat = String(row[1]||"GENERALE").toUpperCase();
                            
                            if(qta > 0 && nome !== "PRODOTTO") {
                                let inMenu = menuRistorante.find(m => m.nome === nome);
                                if(!inMenu) nuoviPiatti.push({ nome: nome, categoria: cat, prezzo: 0, ingredienti: [] });
                                if(inMenu && inMenu.ingredienti) { 
                                    inMenu.ingredienti.forEach(ing => { daScaricare[ing.id_supa] = (daScaricare[ing.id_supa] || 0) + (ing.qta * qta); }); 
                                }
                            }
                        }
                    }
                    
                    if(confirm(`💰 CHIUSURA CASSA RCH PRONTA.\n\nIncasso Rilevato: € ${lordo.toFixed(2)}\n\nConfermando, il sistema inserirà l'incasso in bilancio e scaricherà in background tutte le dosi di Magazzino.\nProcedere?`)) {
                        if(nuoviPiatti.length > 0) { await supabaseClient.from('menu').insert(nuoviPiatti); await caricaMenuCloud(); }
                        for(let id in daScaricare) { 
                            let {data: p} = await supabaseClient.from('inventario').select('quantita').eq('id',id).single(); 
                            if(p) await supabaseClient.from('inventario').update({quantita: p.quantita - daScaricare[id]}).eq('id',id); 
                        }
                        
                        let fileDate = new Date(input.files[0].lastModified); 
                        await supabaseClient.from('finanza').insert([{ tipo:'entrata', categoria:'Ristorante', descrizione: fileID, importo:lordo, iva:iva, stato_pagamento:'pagato', data: fileDate.toISOString() }]);
                        alert("Sincronizzazione Cassa Completata!"); nav('view-dashboard'); await caricaInventarioDaSupabase(); await caricaFinanzaDaSupabase();
                    }
                    input.value = ''; 
                } catch(e) { alert("Errore severo decodifica Excel:\n" + e.message); }
            }; 
            reader.readAsArrayBuffer(input.files[0]);
        };

        window.eseguiChiusuraManualePura = async function() {
            let l = parseFloat(document.getElementById('manual-incasso-tot').value); 
            if(isNaN(l)) return;
            let d = new Date().toISOString(); 
            let ds = new Date(d).toLocaleDateString('it-IT');
            await supabaseClient.from('finanza').insert([{ tipo: 'entrata', categoria: 'Ristorante', descrizione: `Chiusura Manuale del ${ds}`, importo: l, iva: l - (l / 1.10), stato_pagamento: 'pagato', data: d }]);
            document.getElementById('manual-incasso-tot').value = ''; nav('view-dashboard'); caricaFinanzaDaSupabase();
        };

        // ==========================================
        // STOCK MAGAZZINO
        // ==========================================
        window.caricaInventarioDaSupabase = async function() {
            try {
                const { data, error } = await supabaseClient.from('inventario').select('*').order('categoria').order('nome'); 
                if (error) throw error;
                inventarioLocale = data || [];
                
                let htmlList = inventarioLocale.map(p => `
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                        <td class="p-4 w-12 text-center"><input type="checkbox" class="chk-stock w-5 h-5 accent-emerald-600 cursor-pointer shadow-sm rounded" value="${p.id}" onchange="toggleDeleteBulkBtn('stock')"></td>
                        <td class="p-4"><p class="font-black text-[11px] uppercase text-slate-800 tracking-tight">${p.nome}</p><span class="text-[8px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500 border border-slate-200">${p.categoria||'VARIE'}</span></td>
                        <td class="p-4 text-center font-black text-base ${p.quantita < 0 ? 'text-red-500 bg-red-50 rounded-xl' : 'text-emerald-600'}">${p.quantita}</td>
                        <td class="p-4 text-right whitespace-nowrap"><button onclick="apriModificaStock('${p.id}')" class="text-blue-500 bg-blue-50 p-2.5 rounded-lg active:scale-90 transition shadow-sm border border-blue-100 mr-1" title="Modifica Giacenza"><i class="fas fa-pencil"></i></button><button onclick="eliminaProdottoStock('${p.id}')" class="text-red-400 bg-red-50 p-2.5 rounded-lg active:scale-90 transition shadow-sm border border-red-100" title="Elimina Prodotto"><i class="fas fa-trash"></i></button></td>
                    </tr>
                `).join('');
                
                let invBody = document.getElementById('inventory-table-body');
                if(invBody) invBody.innerHTML = htmlList || `<tr><td colspan="4" class="p-10 text-center text-xs text-slate-400 font-bold uppercase"><i class="fas fa-box-open text-4xl text-slate-200 mb-3 block"></i>Magazzino Vuoto</td></tr>`;
                
                popolaSelectIngredienti(); 
                toggleDeleteBulkBtn('stock');
            } catch (e) {
                console.error("Errore Caricamento Magazzino", e);
            }
        };
        
        window.apriModificaStock = async function(id) { 
            let p = inventarioLocale.find(x => x.id === id); 
            let nQ = prompt(`Modifica Giacenza Reale di: ${p.nome}\nInserisci la nuova quantità:`, p.quantita); 
            if(nQ !== null) { 
                await supabaseClient.from('inventario').update({ quantita: parseFloat(nQ.replace(',','.')) }).eq('id', id); 
                await caricaInventarioDaSupabase(); 
            } 
        };
        
        window.eliminaProdottoStock = async function(id) {
            let p = inventarioLocale.find(x => x.id === id); 
            if(confirm(`ATTENZIONE:\nSei sicuro di voler eliminare dal Cloud il prodotto "${p.nome}"?`)) {
                await supabaseClient.from('inventario').delete().eq('id', id); 
                await caricaInventarioDaSupabase();
            }
        };
        
        window.salvaNuovoProdotto = async function() { 
            let nomeInput = document.getElementById('new-nome').value.trim().toUpperCase();
            let qtaInput = parseFloat(document.getElementById('new-qta').value);
            let sogliaInput = parseFloat(document.getElementById('new-soglia').value);
            let catInput = document.getElementById('new-cat').value;
            
            if(!nomeInput) return alert("Errore: Il nome della materia prima è obbligatorio."); 

            let existingItem = inventarioLocale.find(p => p.nome === nomeInput);
            if (existingItem) {
                let newQta = parseFloat(existingItem.quantita) + qtaInput;
                await supabaseClient.from('inventario').update({ quantita: newQta }).eq('id', existingItem.id);
                alert(`AVVISO MAGICO:\nIl prodotto "${nomeInput}" era già presente.\nHo unito le quantità.\nNuova giacenza totale: ${newQta}`);
            } else {
                let pay = { nome: nomeInput, quantita: qtaInput, soglia_minima: sogliaInput, categoria: catInput, prezzo: 0 }; 
                await supabaseClient.from('inventario').insert([pay]); 
            }
            
            document.getElementById('new-nome').value = ''; document.getElementById('new-qta').value = '1';
            nav('view-inventory'); 
        };

        // ==========================================
        // GESTIONE STAFF E ANTICIPI
        // ==========================================
        window.caricaStaff = async function() {
            try {
                const { data } = await supabaseClient.from('staff').select('*').order('nome');
                staffLocale = data || [];
                
                let staffSel = document.getElementById('staff-select');
                if(staffSel) staffSel.innerHTML = staffLocale.map(s => `<option value="${s.nome.replace(/"/g, '&quot;')}">${s.nome}</option>`).join('');

                let html = '';
                let meseSel = document.getElementById('finanza-mese-selettore');
                let mese = meseSel ? meseSel.value : new Date().toISOString().substring(0,7);
                
                for(let s of staffLocale) {
                    const { data: ant } = await supabaseClient.from('finanza').select('importo').eq('categoria', 'Personale').ilike('descrizione', `%Anticipo ${s.nome}%`).filter('data', 'gte', mese+'-01');
                    let totA = (ant || []).reduce((acc, curr) => acc + parseFloat(curr.importo), 0);
                    
                    html += `
                    <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-white hover:bg-slate-50 transition">
                        <div>
                            <p class="font-black text-sm uppercase text-slate-800">${s.nome}</p>
                            <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1"><i class="fas fa-calendar mr-1 text-slate-300"></i> Anticipi del mese</p>
                        </div>
                        <div class="flex items-center">
                            <span class="font-black text-red-500 text-lg tracking-tight">€ ${totA.toLocaleString('it-IT', {minimumFractionDigits:2})}</span>
                            <button onclick="eliminaStaff('${s.id}')" class="text-red-400 bg-red-50 w-9 h-9 flex items-center justify-center rounded-xl ml-4 active:scale-90 transition border border-red-100" title="Elimina Dipendente"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>`;
                }
                
                let staffCont = document.getElementById('staff-list-container');
                if(staffCont) staffCont.innerHTML = html || '<p class="p-6 text-center text-xs text-slate-400 uppercase font-bold">Nessun dipendente registrato.</p>';
            } catch (e) {
                console.error("Errore Staff", e);
            }
        };
        
        window.eliminaStaff = async function(id) {
            if(confirm("Licenziare / Eliminare dal Cloud questo dipendente in modo definitivo?")) {
                await supabaseClient.from('staff').delete().eq('id', id);
                caricaStaff();
            }
        };

        window.salvaAnticipoStaff = async function() {
            let n = document.getElementById('staff-select').value;
            let i = parseFloat(document.getElementById('staff-anticipo-val').value);
            
            if(i > 0) {
                await supabaseClient.from('finanza').insert([{
                    tipo: 'uscita',
                    categoria: 'Personale',
                    descrizione: `Anticipo ${n}`,
                    importo: i,
                    stato_pagamento: 'pagato',
                    data: new Date().toISOString()
                }]);
                
                alert("Anticipo erogato e registrato in Bilancio!");
                document.getElementById('staff-anticipo-val').value = '0.00';
                caricaStaff();
                caricaFinanzaDaSupabase();
            } else {
                alert("Inserire un importo valido per l'anticipo.");
            }
        };

        window.aggiungiDipendente = async function() {
            let n = document.getElementById('new-staff-name').value.trim();
            if(n) {
                await supabaseClient.from('staff').insert([{ nome: n }]);
                document.getElementById('new-staff-name').value = '';
                caricaStaff();
            }
        };
    </script>
</body>
</html>
