#!/usr/bin/env python3
"""
Prosty skrypt do pobierania zawartości tutorial DCTL z mixinglight.com
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

async def crawl_dctl_tutorial():
    """Główna funkcja crawlowania tutorial DCTL"""
    
    start_url = "https://mixinglight.com/color-grading-tutorials/creative-coding-with-dctl-part-1/"
    
    print("🚀 Rozpoczynam crawlowanie tutorial DCTL...")
    print(f"URL startowy: {start_url}")
    print("")
    
    # Konfiguracja crawlera
    config = CrawlerRunConfig(
        word_count_threshold=10,
        cache_mode=CacheMode.BYPASS,
        verbose=True
    )
    
    # Lista do przechowywania wyników
    crawled_data = []
    
    async with AsyncWebCrawler(verbose=True) as crawler:
        try:
            print("Pobieranie głównej strony...")
            result = await crawler.arun(url=start_url, config=config)
            
            if result.success:
                print(f"✅ Pomyślnie pobrano główną stronę")
                print(f"Rozmiar HTML: {len(result.html)} znaków")
                print(f"Rozmiar Markdown: {len(result.markdown.raw_markdown) if result.markdown else 0} znaków")
                
                # Zapisujemy dane głównej strony
                main_page_data = {
                    'url': start_url,
                    'title': 'Creative Coding With DCTL: Part 1',
                    'html': result.html,
                    'markdown': result.markdown.raw_markdown if result.markdown else '',
                    'cleaned_html': result.cleaned_html or '',
                    'links': result.links,
                    'media': result.media,
                    'metadata': result.metadata or {},
                    'depth': 0
                }
                crawled_data.append(main_page_data)
                
                # Szukamy linków do innych części serii DCTL
                dctl_links = []
                if result.links and 'internal' in result.links:
                    for link in result.links['internal']:
                        href = link.get('href', '')
                        text = link.get('text', '').lower()
                        
                        if ('dctl' in href.lower() or 'dctl' in text) and 'part' in text:
                            full_url = urljoin(start_url, href)
                            if full_url not in [start_url]:  # Nie duplikujemy głównej strony
                                dctl_links.append({
                                    'url': full_url,
                                    'text': link.get('text', ''),
                                    'title': link.get('title', '')
                                })
                
                print(f"Znaleziono {len(dctl_links)} powiązanych linków DCTL")
                
                # Crawlujemy powiązane strony (maksymalnie 5)
                for i, link_info in enumerate(dctl_links[:5]):
                    try:
                        print(f"Pobieranie strony {i+1}/{min(len(dctl_links), 5)}: {link_info['text']}")
                        sub_result = await crawler.arun(url=link_info['url'], config=config)
                        
                        if sub_result.success:
                            sub_page_data = {
                                'url': link_info['url'],
                                'title': link_info['text'] or f'DCTL Tutorial Part {i+2}',
                                'html': sub_result.html,
                                'markdown': sub_result.markdown.raw_markdown if sub_result.markdown else '',
                                'cleaned_html': sub_result.cleaned_html or '',
                                'links': sub_result.links,
                                'media': sub_result.media,
                                'metadata': sub_result.metadata or {},
                                'depth': 1
                            }
                            crawled_data.append(sub_page_data)
                            print(f"✅ Pobrano: {link_info['text']}")
                        else:
                            print(f"❌ Błąd pobierania: {link_info['url']}")
                            
                    except Exception as e:
                        print(f"❌ Wyjątek podczas pobierania {link_info['url']}: {str(e)}")
                        
            else:
                print(f"❌ Błąd pobierania głównej strony: {result.error_message}")
                return
                
        except Exception as e:
            print(f"❌ Błąd krytyczny: {str(e)}")
            return
    
    # Generowanie raportu markdown
    print(f"\n📝 Generowanie raportu markdown...")
    markdown_content = generate_markdown_report(crawled_data)
    
    # Zapisywanie do pliku
    output_file = "dctl_tutorial_complete.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    
    print(f"✅ Raport zapisany do: {output_file}")
    print(f"📊 Pobrano łącznie {len(crawled_data)} stron")
    print(f"📏 Rozmiar pliku: {os.path.getsize(output_file)} bajtów")

def generate_markdown_report(crawled_data):
    """Generuje raport markdown z pobranych danych"""
    
    if not crawled_data:
        return "Brak danych do wygenerowania raportu."
    
    markdown_lines = []
    
    # Nagłówek
    markdown_lines.append("# DCTL (DaVinci Color Transform Language) - Kompletny Przewodnik")
    markdown_lines.append("")
    markdown_lines.append(f"*Wygenerowano: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*")
    markdown_lines.append("")
    markdown_lines.append("**Źródło:** [Mixing Light - Creative Coding With DCTL](https://mixinglight.com/color-grading-tutorials/creative-coding-with-dctl-part-1/)")
    markdown_lines.append("")
    markdown_lines.append("---")
    markdown_lines.append("")
    
    # Spis treści
    markdown_lines.append("## 📋 Spis Treści")
    markdown_lines.append("")
    
    for i, page in enumerate(crawled_data, 1):
        title = clean_title(page['title'])
        anchor = create_anchor(title)
        indent = "  " * page['depth']
        markdown_lines.append(f"{indent}- [{i}. {title}](#{anchor})")
    
    markdown_lines.append("")
    markdown_lines.append("---")
    markdown_lines.append("")
    
    # Zawartość stron
    for i, page in enumerate(crawled_data, 1):
        title = clean_title(page['title'])
        depth_prefix = "#" * (page['depth'] + 2)
        
        markdown_lines.append(f"{depth_prefix} {i}. {title}")
        markdown_lines.append("")
        markdown_lines.append(f"**URL:** {page['url']}")
        markdown_lines.append("")
        
        # Główna zawartość markdown
        if page['markdown']:
            cleaned_markdown = clean_markdown_content(page['markdown'])
            markdown_lines.append(cleaned_markdown)
        else:
            markdown_lines.append("*Brak zawartości markdown*")
        
        markdown_lines.append("")
        markdown_lines.append("---")
        markdown_lines.append("")
    
    # Dodatek - informacje o mediach i linkach
    markdown_lines.append("## 📎 Dodatek - Zasoby i Linki")
    markdown_lines.append("")
    
    all_images = []
    all_external_links = []
    
    for page in crawled_data:
        if page['media'] and 'images' in page['media']:
            all_images.extend(page['media']['images'])
        
        if page['links'] and 'external' in page['links']:
            all_external_links.extend(page['links']['external'])
    
    if all_images:
        markdown_lines.append("### 🖼️ Obrazy")
        markdown_lines.append("")
        for img in all_images[:10]:  # Maksymalnie 10 obrazów
            src = img.get('src', '')
            alt = img.get('alt', 'Obraz')
            if src:
                markdown_lines.append(f"- ![{alt}]({src})")
        markdown_lines.append("")
    
    if all_external_links:
        markdown_lines.append("### 🔗 Linki zewnętrzne")
        markdown_lines.append("")
        unique_links = {link['href']: link for link in all_external_links if link.get('href')}.values()
        for link in list(unique_links)[:15]:  # Maksymalnie 15 linków
            href = link.get('href', '')
            text = link.get('text', href)
            if href:
                markdown_lines.append(f"- [{text}]({href})")
        markdown_lines.append("")
    
    return "\n".join(markdown_lines)

def clean_title(title):
    """Czyści tytuł z niepotrzebnych znaków"""
    if not title:
        return "Bez tytułu"
    
    # Usuwamy nadmiarowe białe znaki
    title = re.sub(r'\s+', ' ', title.strip())
    
    # Usuwamy znaki specjalne z początku i końca
    title = re.sub(r'^[^\w\s]+|[^\w\s]+$', '', title)
    
    return title

def create_anchor(title):
    """Tworzy kotwicę dla spisu treści"""
    anchor = re.sub(r'[^\w\s-]', '', title.lower())
    anchor = re.sub(r'[-\s]+', '-', anchor).strip('-')
    return anchor

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
        # Menu główne
        r'Search:\s*\*\s*\[Color Grading.*?\]\(.*?\).*?(?=\n##|\n\[|$)',
        r'\*\s*\[Tutorial Library Index\].*?\n',
        r'\*\s*\[Focused Flight Paths\].*?\n',
        r'\*\s*\[Tutorial Library Membership\].*?\n',
        r'\*\s*\[\s*Learn DaVinci Resolve\].*?\n',
        r'\*\s*\[\s*DaVinci Resolve Courses\].*?\n',
        r'\*\s*\[\s*The All-Access Accelerator\].*?\n',
        r'\*\s*\[\s*Grading Practice Projects\].*?\n',
        r'\*\s*\[\s*Login\].*?\n',
        r'\*\s*\[Join Now!\].*?\n',
        
        # Breadcrumbs
        r'\[Tutorials\]\(.*?\) / \[.*?\]\(.*?\) / .*?\n',
        
        # Nawigacja między artykułami
        r'## Post navigation.*?(?=\n##|\n\[|$)',
        r'\[\s*Prev\s*\]\(.*?\).*?\[\s*Next\s*\]\(.*?\)',
        
        # Logo i nagłówek strony
        r'\[\s*!\[Mixing Light\].*?\]\(.*?\)',
        
        # Przyciski udostępniania
        r'\*\s*\[\]\(https://www\.facebook\.com/sharer.*?\)\n',
        r'\*\s*\[\]\(https://x\.com/share.*?\)\n',
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
        
        # Blokowanie użytkowników  
        r'Block Member\?.*?Please allow a few minutes for this process to complete\.\s*Confirm',
        r'####\s*Block Member\?.*?Confirm',
        
        # Powiadomienia o zgłoszeniach
        r'####\s*Report\s+You have already reported this\s*\.',
        r'You have already reported this\s*\.',
        
        # Harassment i inne kategorie zgłoszeń
        r'Harassment\s+Harassment or bullying behavior.*?Other',
        r'Inappropriate\s+Contains mature or sensitive content',
        r'Offensive\s+Contains abusive or derogatory content', 
        r'Suspicious\s+Contains spam, fake content or potential malware',
        
        # Elementy moderacyjne
        r'You will no longer be able to:\s*\*\s*See blocked member.*?\*\s*Mention this member.*?(?=\n\n|\n#|$)',
    ]
    
    for pattern in moderation_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.MULTILINE | re.IGNORECASE)
    
    return content

def remove_footer_elements(content):
    """Usuwa elementy stopki i kontaktu"""
    
    # Wzorce elementów stopki
    footer_patterns = [
        # Informacje o produkcie
        r'##### Our Products.*?(?=\n##|\n##### |$)',
        
        # Informacje kontaktowe
        r'##### Contact.*?This field is for validation purposes.*?(?=\n##|\n##### |$)',
        r'##### Stay In Touch.*?This field is for validation purposes.*?(?=\n##|\n##### |$)',
        
        # Informacje o firmie
        r'##### About.*?About Mixing Light.*?\n',
        r'Mixing Light provides industry leading tutorials.*?Join our community!.*?\n',
        
        # Status i linki społecznościowe
        r'MixingLight\.com Uptime Status.*?\n',
        r'\*\s*\[\]\(https://www\.facebook\.com/MixingLight/\).*?\n',
        r'\*\s*\[\]\(https://x\.com/MixingLight\).*?\n',
        r'\*\s*\[\]\(https://www\.linkedin\.com.*?\).*?\n',
        r'\*\s*\[\]\(https://mixinglight\.com/press/\).*?\n',
        
        # Copyright
        r'© \d{4} Mixing Light, LLC\..*?Terms of Use.*?\n',
        
        # Telefon i adres
        r'\*\s*\[\s*\(\d{3}\)\s*\d{3}-\d{4}\].*?\n',
        r'\*\s*\[\s*\d+\s+.*?Penny Farms.*?\].*?\n',
        
        # Pola formularza
        r'"?\*"?\s*indicates required fields.*?\n',
        r'Email\*.*?First Name\*.*?Phone.*?This field is for validation.*?\n',
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
        
        # Playlist i dodawanie
        r'×.*?## Add to Playlist.*?Add to New Playlist.*?\n',
        r'##### Adding to Playlist\.\.\..*?Add to New Playlist.*?\n',
        
        # Powiadomienia push
        r'Notifications.*?Subscribe to push notifications.*?Yes, please\.No Thanks',
        r'!\[notification icon\].*?Yes, please\.No Thanks',
        
        # Informacje o kosztach
        r'Did you know\?.*?## Maintaining.*?Check out our membership options.*?\n',
        
        # Tracking i analytics
        r'!\[\]\(https://cdn\.usefathom\.com.*?\)',
        r'!\[\]\(https://app\.monstercampaigns\.com.*?\)',
        
        # Loading i inne elementy dynamiczne
        r'!\[\]\(data:image/svg\+xml.*?\)\s*Loading\.\.\.',
        
        # Metadane artykułu (czasem niepotrzebne)
        r'Insight #\s*ML\s*\d+.*?\n',
        r'Type\s+(Article|Video).*?\n',
        r'Duration\s+\d+:\d+.*?\n',
        r'Skill Level\s+(Beginner|Intermediate|Advanced).*?\n',
        
        # Serie i kategorie (jeśli są redundantne)
        r'Series\s*\|\s*\*\s*\[Creative Coding With DCTL\].*?\n',
        r'Categories\s*\[DCTL\].*?\n',
        r'Skills\s*\[.*?\].*?\n',
        
        # Inne powtarzające się elementy
        r'Other Tutorials in this Series.*?View All.*?\n',
        r'Username\s*\|\s*---\s*\|\s*---.*?Password.*?\|.*?\n',
    ]
    
    for pattern in ui_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.MULTILINE)
    
    return content

if __name__ == "__main__":
    asyncio.run(crawl_dctl_tutorial()) 