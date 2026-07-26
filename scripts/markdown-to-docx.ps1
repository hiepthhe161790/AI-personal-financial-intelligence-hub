param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression

function Escape-Xml([string]$Text) {
  [System.Security.SecurityElement]::Escape($Text)
}

function Paragraph([string]$Text, [string]$Style = 'Normal') {
  $escaped = Escape-Xml $Text
  "<w:p><w:pPr><w:pStyle w:val=`"$Style`"/></w:pPr><w:r><w:t xml:space=`"preserve`">$escaped</w:t></w:r></w:p>"
}

$lines = Get-Content -LiteralPath $InputPath -Encoding UTF8
$body = [System.Collections.Generic.List[string]]::new()
$inCode = $false
foreach ($line in $lines) {
  if ($line -match '^```') { $inCode = -not $inCode; continue }
  if ($inCode) { $body.Add((Paragraph $line 'Code')); continue }
  if ([string]::IsNullOrWhiteSpace($line)) { $body.Add('<w:p/>'); continue }
  if ($line -match '^# (.+)$') { $body.Add((Paragraph $Matches[1] 'Title')); continue }
  if ($line -match '^## (.+)$') { $body.Add((Paragraph $Matches[1] 'Heading1')); continue }
  if ($line -match '^### (.+)$') { $body.Add((Paragraph $Matches[1] 'Heading2')); continue }
  if ($line -match '^- \[ \] (.+)$') { $body.Add((Paragraph ([char]0x2610 + ' ' + $Matches[1]) 'List')); continue }
  if ($line -match '^- (.+)$') { $body.Add((Paragraph ([char]0x2022 + ' ' + $Matches[1]) 'List')); continue }
  if ($line -match '^\|') { $body.Add((Paragraph $line 'Code')); continue }
  $body.Add((Paragraph $line 'Normal'))
}

$contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>
'@
$relationships = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>
'@
$documentRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>
'@
$styles = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="1F4E78"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1F4E78"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="2F75B5"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="List"><w:name w:val="List"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="360" w:hanging="180"/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="Code"><w:name w:val="Code"/><w:basedOn w:val="Normal"/><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="18"/></w:rPr></w:style></w:styles>
'@
$timestamp = (Get-Date).ToUniversalTime().ToString('s') + 'Z'
$core = "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><cp:coreProperties xmlns:cp=`"http://schemas.openxmlformats.org/package/2006/metadata/core-properties`" xmlns:dc=`"http://purl.org/dc/elements/1.1/`" xmlns:dcterms=`"http://purl.org/dc/terms/`" xmlns:xsi=`"http://www.w3.org/2001/XMLSchema-instance`"><dc:title>AI Personal Financial Intelligence Hub - Implementation Blueprint</dc:title><dc:creator>Codex</dc:creator><dcterms:created xsi:type=`"dcterms:W3CDTF`">$timestamp</dcterms:created></cp:coreProperties>"
$app = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Codex</Application></Properties>'
$document = "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><w:document xmlns:w=`"http://schemas.openxmlformats.org/wordprocessingml/2006/main`"><w:body>$($body -join '')<w:sectPr><w:pgSz w:w=`"11906`" w:h=`"16838`"/><w:pgMar w:top=`"1440`" w:right=`"1440`" w:bottom=`"1440`" w:left=`"1440`"/></w:sectPr></w:body></w:document>"

$targetDir = Split-Path -Parent $OutputPath
if (-not (Test-Path -LiteralPath $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
if (Test-Path -LiteralPath $OutputPath) { Remove-Item -LiteralPath $OutputPath -Force }
$stream = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::CreateNew)
try {
  $zip = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
  try {
    $parts = @{
      '[Content_Types].xml' = $contentTypes; '_rels/.rels' = $relationships; 'word/_rels/document.xml.rels' = $documentRels
      'word/document.xml' = $document; 'word/styles.xml' = $styles; 'docProps/core.xml' = $core; 'docProps/app.xml' = $app
    }
    foreach ($name in $parts.Keys) {
      $entry = $zip.CreateEntry($name)
      $writer = [System.IO.StreamWriter]::new($entry.Open(), [System.Text.UTF8Encoding]::new($false))
      try { $writer.Write($parts[$name]) } finally { $writer.Dispose() }
    }
  } finally { $zip.Dispose() }
} finally { $stream.Dispose() }

Write-Output "Created $OutputPath"
