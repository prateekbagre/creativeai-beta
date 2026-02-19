$content = Get-Content 'prd_content/word/document.xml' -Raw
[regex]::Matches($content, '<w:t.*?>(.*?)</w:t>').Groups | 
    Where-Object { $_.Name -eq '1' } | 
    ForEach-Object { $_.Value } | 
    Out-File -FilePath 'prd_text.txt' -Encoding utf8
