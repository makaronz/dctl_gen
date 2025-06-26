#!/usr/bin/env python3
"""
Uniwersalny skrypt do pobierania zawartości stron internetowych
Używa crawl4ai do pobrania głównej strony i powiązanych stron
Zapisuje wyniki w formacie markdown z spisem treści
"""

import asyncio
import json
import os
import re
from urllib.parse import urljoin, urlparse
from datetime import datetime
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode

# =============================================================================
# 🎯 KONFIGURACJA - WKLEJ TUTAJ SWÓJ URL
# =============================================================================

TARGET_URL = "https://zenn.dev/omakazu/articles/0d63566ebea6d3"  # ← WKLEJ TUTAJ URL STRONY DO CRAWLOWANIA

# =============================================================================

async def crawl_website():
    """Główna funkcja crawlowania strony internetowej"""
    
    start_url = TARGET_URL
    
    if start_url == "https://example.com":
        print("❌ BŁĄD: Musisz wkleić właściwy URL w zmiennej TARGET_URL")
        print("   Znajdź linię: TARGET_URL = \"https://example.com\"")
        print("   I zamień na: TARGET_URL = \"twój-url-tutaj\"")
        return
    
    print("🚀 Rozpoczynam crawlowanie strony...")
    print(f"URL startowy: {start_url}")
    print("")
    
    # Konfiguracja crawlera
    config = CrawlerRunConfig(
        word_count_threshold=10,
        cache_mode=CacheMode.BYPASS,
        verbose=True
    )
    
    crawled_urls = set()
    all_content = []
    
    async with AsyncWebCrawler() as crawler:
        # Pobierz główną stronę
        print("Pobieranie głównej strony...")
        result = await crawler.arun(start_url, config=config)
        
        if result.success:
            print("✅ Pomyślnie pobrano główną stronę")
            print(f"Rozmiar HTML: {len(result.html)} znaków")
            print(f"Rozmiar Markdown: {len(result.markdown)} znaków")
            
            # Wyczyść zawartość
            cleaned_content = clean_markdown_content(result.markdown)
            
            # Dodaj do kolekcji
            page_info = {
                'url': start_url,
                'title': extract_title_from_content(cleaned_content),
                'content': cleaned_content,
                'links': result.links.get('internal', []) if result.links else []
            }
            all_content.append(page_info)
            crawled_urls.add(start_url)
            
            # Znajdź powiązane linki
            related_links = find_related_links(result.links.get('internal', []) if result.links else [], start_url)
            print(f"Znaleziono {len(related_links)} powiązanych linków")
            
            # Pobierz powiązane strony (maksymalnie 5)
            for i, link_info in enumerate(related_links[:5]):
                link_url = link_info['url']
                if link_url not in crawled_urls:
                    print(f"Pobieranie strony {i+1}/{len(related_links[:5])}: {link_info['text']}")
                    
                    try:
                        link_result = await crawler.arun(link_url, config=config)
                        if link_result.success:
                            print(f"✅ Pobrano: {link_info['text']}")
                            
                            # Wyczyść zawartość
                            cleaned_link_content = clean_markdown_content(link_result.markdown)
                            
                            link_page_info = {
                                'url': link_url,
                                'title': link_info['text'],
                                'content': cleaned_link_content,
                                'links': link_result.links.get('internal', []) if link_result.links else []
                            }
                            all_content.append(link_page_info)
                            crawled_urls.add(link_url)
                        else:
                            print(f"❌ Błąd pobierania: {link_url}")
                    except Exception as e:
                        print(f"❌ Błąd: {e}")
        else:
            print("❌ Błąd pobierania głównej strony")
            return
    
    # Generuj raport markdown
    print("\n📝 Generowanie raportu markdown...")
    markdown_report = generate_markdown_report(all_content, start_url)
    
    # Zapisz do pliku
    domain = urlparse(start_url).netloc.replace('www.', '').replace('.', '_')
    filename = f"{domain}_content.md"
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(markdown_report)
    
    print(f"✅ Raport zapisany do: {filename}")
    print(f"📊 Pobrano łącznie {len(all_content)} stron")
    print(f"📏 Rozmiar pliku: {os.path.getsize(filename)} bajtów")

def extract_title_from_content(content):
    """Wyciąga tytuł z zawartości markdown"""
    lines = content.split('\n')
    for line in lines:
        if line.startswith('# '):
            return line[2:].strip()
    return "Bez tytułu"

def find_related_links(links, base_url):
    """Znajduje powiązane linki na stronie"""
    if not links:
        return []
    
    base_domain = urlparse(base_url).netloc
    related_links = []
    
    for link in links:
        if isinstance(link, dict):
            link_url = link.get('href', '')
            link_text = link.get('text', '')
        else:
            link_url = str(link)
            link_text = link_url
        
        # Sprawdź czy link jest z tej samej domeny
        if link_url and base_domain in link_url:
            # Unikaj duplikatów i linków do głównej strony
            if link_url != base_url and link_url not in [l['url'] for l in related_links]:
                related_links.append({
                    'url': link_url,
                    'text': link_text[:100] if link_text else link_url
                })
    
    return related_links

def generate_markdown_report(content_list, source_url):
    """Generuje raport markdown z pobranej zawartości"""
    
    domain = urlparse(source_url).netloc.replace('www.', '')
    
    report = f"""# Zawartość strony - {domain.title()}

*Wygenerowano: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*

**Źródło:** [{domain}]({source_url})

---

## 📋 Spis Treści

"""
    
    # Generuj spis treści
    for i, page in enumerate(content_list):
        title = page['title']
        anchor = title.lower().replace(' ', '-').replace(':', '').replace('?', '').replace('!', '')
        anchor = re.sub(r'[^\w\-]', '', anchor)
        report += f"- [{i+1}. {title}](#{anchor})\n"
    
    report += "\n---\n\n"
    
    # Dodaj zawartość każdej strony
    for i, page in enumerate(content_list):
        title = page['title']
        url = page['url']
        content = page['content']
        
        report += f"## {i+1}. {title}\n\n"
        report += f"**URL:** {url}\n\n"
        report += f"{content}\n\n"
        
        if i < len(content_list) - 1:
            report += "---\n\n"
    
    # Dodaj dodatkowe zasoby
    report += "\n## 📚 Dodatkowe Zasoby\n\n"
    
    all_links = []
    
    for page in content_list:
        if page.get('links'):
            all_links.extend(page['links'])
    
    if all_links:
        report += "### 🔗 Powiązane Linki\n\n"
        unique_links = list({link['href']: link for link in all_links if isinstance(link, dict)}.values())[:10]
        for link in unique_links:
            if link.get('text') and link.get('href'):
                report += f"- [{link['text']}]({link['href']})\n"
    
    return report

def clean_markdown_content(content):
    """Czyści zawartość markdown z niepotrzebnych elementów"""
    if not content:
        return ""
    
    # Usuwamy elementy nawigacyjne i menu
    content = remove_navigation_elements(content)
    
    # Usuwamy elementy moderacyjne i zgłaszania
    content = remove_moderation_elements(content)
    
    # Usuwamy elementy stopki i kontaktu
    content = remove_footer_elements(content)
    
    # Usuwamy powtarzające się elementy UI
    content = remove_ui_elements(content)
    
    # Usuwamy nadmiarowe puste linie
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
    
    # Usuwamy długie ciągi spacji
    content = re.sub(r' {3,}', ' ', content)
    
    # Usuwamy znaki kontrolne
    content = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', content)
    
    return content.strip()

def remove_navigation_elements(content):
    """Usuwa elementy nawigacyjne i menu"""
    
    # Wzorce do usunięcia - elementy nawigacyjne
    nav_patterns = [
        # Menu główne i nawigacja
        r'Search:\s*\*\s*\[.*?\]\(.*?\).*?(?=\n##|\n\[|$)',
        r'\*\s*\[Home\].*?\n',
        r'\*\s*\[About\].*?\n',
        r'\*\s*\[Contact\].*?\n',
        r'\*\s*\[Login\].*?\n',
        r'\*\s*\[Register\].*?\n',
        r'\*\s*\[Sign Up\].*?\n',
        r'\*\s*\[Menu\].*?\n',
        
        # Breadcrumbs
        r'\[.*?\]\(.*?\) / \[.*?\]\(.*?\) / .*?\n',
        r'Home > .*?\n',
        r'Strona główna > .*?\n',
        
        # Nawigacja między artykułami
        r'## Post navigation.*?(?=\n##|\n\[|$)',
        r'\[\s*Prev\s*\]\(.*?\).*?\[\s*Next\s*\]\(.*?\)',
        r'\[\s*Previous\s*\]\(.*?\).*?\[\s*Next\s*\]\(.*?\)',
        r'\[\s*Poprzedni\s*\]\(.*?\).*?\[\s*Następny\s*\]\(.*?\)',
        
        # Logo i nagłówki strony
        r'\[\s*!\[.*?\].*?\]\(.*?\)',
        
        # Przyciski udostępniania
        r'\*\s*\[\]\(https://www\.facebook\.com/sharer.*?\)\n',
        r'\*\s*\[\]\(https://x\.com/share.*?\)\n',
        r'\*\s*\[\]\(https://twitter\.com/share.*?\)\n',
        r'\*\s*\[\]\(mailto:.*?\)\n',
        r'\*\s*\[\]\(.*?facebook.*?\)\n',
        r'\*\s*\[\]\(.*?twitter.*?\)\n',
    ]
    
    for pattern in nav_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.MULTILINE)
    
    return content

def remove_moderation_elements(content):
    """Usuwa elementy moderacyjne i zgłaszania"""
    
    # Wzorce elementów moderacyjnych
    moderation_patterns = [
        # Zgłaszanie postów
        r'Report\s+There was a problem reporting this post\..*?Report note\s+Report',
        r'####\s*Report.*?Report note.*?Report',
        r'Zgłoś.*?Problem z zgłoszeniem.*?Zgłoś',
        
        # Blokowanie użytkowników  
        r'Block Member\?.*?Please allow a few minutes for this process to complete\.\s*Confirm',
        r'####\s*Block Member\?.*?Confirm',
        r'Zablokuj użytkownika\?.*?Potwierdź',
        
        # Powiadomienia o zgłoszeniach
        r'####\s*Report\s+You have already reported this\s*\.',
        r'You have already reported this\s*\.',
        r'Już zgłosiłeś.*?\.',
        
        # Harassment i inne kategorie zgłoszeń
        r'Harassment\s+Harassment or bullying behavior.*?Other',
        r'Inappropriate\s+Contains mature or sensitive content',
        r'Offensive\s+Contains abusive or derogatory content', 
        r'Suspicious\s+Contains spam, fake content or potential malware',
        r'Molestowanie.*?Inne',
        r'Nieodpowiednie.*?Obraźliwe',
        
        # Elementy moderacyjne
        r'You will no longer be able to:\s*\*\s*See blocked member.*?\*\s*Mention this member.*?(?=\n\n|\n#|$)',
        r'Nie będziesz już mógł.*?(?=\n\n|\n#|$)',
    ]
    
    for pattern in moderation_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.MULTILINE | re.IGNORECASE)
    
    return content

def remove_footer_elements(content):
    """Usuwa elementy stopki i kontaktu"""
    
    # Wzorce elementów stopki
    footer_patterns = [
        # Informacje o produkcie/firmie
        r'##### Our Products.*?(?=\n##|\n##### |$)',
        r'##### Nasze Produkty.*?(?=\n##|\n##### |$)',
        
        # Informacje kontaktowe
        r'##### Contact.*?This field is for validation purposes.*?(?=\n##|\n##### |$)',
        r'##### Stay In Touch.*?This field is for validation purposes.*?(?=\n##|\n##### |$)',
        r'##### Kontakt.*?To pole służy do walidacji.*?(?=\n##|\n##### |$)',
        
        # Informacje o firmie
        r'##### About.*?About .*?\n',
        r'##### O nas.*?O firmie.*?\n',
        
        # Status i linki społecznościowe
        r'.*?Uptime Status.*?\n',
        r'\*\s*\[\]\(https://www\.facebook\.com/.*?\).*?\n',
        r'\*\s*\[\]\(https://x\.com/.*?\).*?\n',
        r'\*\s*\[\]\(https://twitter\.com/.*?\).*?\n',
        r'\*\s*\[\]\(https://www\.linkedin\.com.*?\).*?\n',
        r'\*\s*\[\]\(https://.*?/press/\).*?\n',
        
        # Copyright
        r'© \d{4}.*?Terms of Use.*?\n',
        r'© \d{4}.*?Regulamin.*?\n',
        r'Copyright \d{4}.*?\n',
        
        # Telefon i adres
        r'\*\s*\[\s*\(\d{3}\)\s*\d{3}-\d{4}\].*?\n',
        r'\*\s*\[\s*\+\d+.*?\].*?\n',
        r'\*\s*\[\s*\d+\s+.*?\].*?\n',
        
        # Pola formularza
        r'"?\*"?\s*indicates required fields.*?\n',
        r'"?\*"?\s*oznacza pola wymagane.*?\n',
        r'Email\*.*?First Name\*.*?Phone.*?This field is for validation.*?\n',
        r'E-mail\*.*?Imię\*.*?Telefon.*?To pole służy do walidacji.*?\n',
    ]
    
    for pattern in footer_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.MULTILINE)
    
    return content

def remove_ui_elements(content):
    """Usuwa powtarzające się elementy interfejsu użytkownika"""
    
    # Wzorce elementów UI
    ui_patterns = [
        # Membership i paywall
        r'### Member Content.*?Need more information about our memberships.*?(?=\n##|\n### |$)',
        r'Sorry\.\.\. the rest of this content is for members only\..*?Membership options.*?\n',
        r'##### Member Login.*?Remember me.*?\n',
        r'## Membership Required.*?Join Today.*?Close.*?\n',
        r'\*\*Bonus\*\*\s*:.*?Join Today.*?\n',
        r'### Treść dla członków.*?(?=\n##|\n### |$)',
        r'Przepraszamy.*?reszta treści jest tylko dla członków.*?\n',
        
        # Playlist i dodawanie
        r'×.*?## Add to Playlist.*?Add to New Playlist.*?\n',
        r'##### Adding to Playlist\.\.\..*?Add to New Playlist.*?\n',
        r'×.*?## Dodaj do playlisty.*?Dodaj do nowej playlisty.*?\n',
        
        # Powiadomienia push
        r'Notifications.*?Subscribe to push notifications.*?Yes, please\.No Thanks',
        r'!\[notification icon\].*?Yes, please\.No Thanks',
        r'Powiadomienia.*?Subskrybuj powiadomienia.*?Tak.*?Nie, dziękuję',
        
        # Informacje o kosztach
        r'Did you know\?.*?## Maintaining.*?Check out our membership options.*?\n',
        r'Czy wiesz\?.*?## Utrzymanie.*?Sprawdź nasze opcje członkostwa.*?\n',
        
        # Tracking i analytics
        r'!\[\]\(https://cdn\.usefathom\.com.*?\)',
        r'!\[\]\(https://app\.monstercampaigns\.com.*?\)',
        r'!\[\]\(https://.*?analytics.*?\)',
        r'!\[\]\(https://.*?tracking.*?\)',
        
        # Loading i inne elementy dynamiczne
        r'!\[\]\(data:image/svg\+xml.*?\)\s*Loading\.\.\.',
        r'Ładowanie\.\.\.',
        
        # Metadane artykułu (czasem niepotrzebne)
        r'Type\s+(Article|Video).*?\n',
        r'Duration\s+\d+:\d+.*?\n',
        r'Skill Level\s+(Beginner|Intermediate|Advanced).*?\n',
        r'Typ\s+(Artykuł|Wideo).*?\n',
        r'Czas trwania\s+\d+:\d+.*?\n',
        r'Poziom\s+(Początkujący|Średni|Zaawansowany).*?\n',
        
        # Inne powtarzające się elementy
        r'Other .*? in this Series.*?View All.*?\n',
        r'Username\s*\|\s*---\s*\|\s*---.*?Password.*?\|.*?\n',
        r'Nazwa użytkownika\s*\|\s*---\s*\|\s*---.*?Hasło.*?\|.*?\n',
        
        # Cookies i GDPR
        r'This website uses cookies.*?Accept.*?\n',
        r'Ta strona używa plików cookie.*?Akceptuj.*?\n',
        r'We use cookies.*?(?=\n##|\n### |$)',
        r'Używamy plików cookie.*?(?=\n##|\n### |$)',
    ]
    
    for pattern in ui_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.MULTILINE)
    
    return content

if __name__ == "__main__":
    asyncio.run(crawl_website()) 