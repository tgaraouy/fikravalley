# Script de Correction SQL pour Use Cases
# Ce script corrige les erreurs communes dans le SQL des use cases

$sqlFile = "supabase/use_cases_corrected.sql"
$inputSql = @"
-- Collez votre SQL ici
"@

# Corrections à appliquer
$corrections = @{
    # 1. workshop_conversation → workshop
    "'workshop_conversation'" = "'workshop'"
    
    # 2. currentrole → current_role
    "currentrole," = "current_role,"
    
    # 3. ON CONFLICT DO NULL → DO NOTHING
    "ON CONFLICT (id) DO NULL;" = "ON CONFLICT (id) DO NOTHING;"
    
    # 4. submitter_type invalides
    "'cooperative_leader'" = "'entrepreneur'"
    "'farmer'" = "'entrepreneur'"
    "'community_leader'" = "'entrepreneur'"
    
    # 5. max_cofund_amount format
    "max_cofund_amount, '75000 EUR'" = "max_cofund_amount, 75000.00"
    "max_cofund_amount, '50000 EUR'" = "max_cofund_amount, 50000.00"
    "max_cofund_amount, '100000 EUR'" = "max_cofund_amount, 100000.00"
    "max_cofund_amount, '60000 EUR'" = "max_cofund_amount, 60000.00"
    "max_cofund_amount, '40000 EUR'" = "max_cofund_amount, 40000.00"
    "max_cofund_amount, '30000 EUR'" = "max_cofund_amount, 30000.00"
    "max_cofund_amount, '70000 EUR'" = "max_cofund_amount, 70000.00"
    
    # 6. current_role format (ARRAY → TEXT, prendre première valeur)
    "ARRAY['CEO', 'Cooperative Founder']" = "'CEO'"
    "ARRAY['Head of Product']" = "'Head of Product'"
    "ARRAY['E-commerce Director']" = "'E-commerce Director'"
    "ARRAY['CTO', 'Blockchain Lead']" = "'CTO'"
    "ARRAY['VP Engineering']" = "'VP Engineering'"
    "ARRAY['Head of AgTech']" = "'Head of AgTech'"
    "ARRAY['Lead Engineer']" = "'Lead Engineer'"
    "ARRAY['Founder', 'NLP Engineer']" = "'Founder'"
    "ARRAY['Event Tech Lead']" = "'Event Tech Lead'"
    "ARRAY['Marine Tech Director']" = "'Marine Tech Director'"
}

Write-Host "`n🔧 Application des corrections...`n" -ForegroundColor Cyan

$correctedSql = $inputSql
foreach ($key in $corrections.Keys) {
    $value = $corrections[$key]
    $count = ([regex]::Matches($correctedSql, [regex]::Escape($key))).Count
    if ($count -gt 0) {
        $correctedSql = $correctedSql -replace [regex]::Escape($key), $value
        Write-Host "✅ Corrigé: $key → $value ($count occurrences)" -ForegroundColor Green
    }
}

# Sauvegarder
$correctedSql | Out-File -FilePath $sqlFile -Encoding UTF8

Write-Host "`n✅ Fichier corrigé sauvegardé: $sqlFile`n" -ForegroundColor Green

