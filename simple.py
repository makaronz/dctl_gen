#!/usr/bin/env python3
"""
Skrypt do testowania funkcji czyszczenia markdown
"""

import re

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

def test_cleaning():
    """Testuje funkcje czyszczenia na istniejącym pliku"""
    
    print("🧹 Testowanie funkcji czyszczenia markdown...")
    
    # Wczytaj istniejący plik
    try:
        with open('dctl_tutorial_complete.md', 'r', encoding='utf-8') as f:
            original_content = f.read()
    except FileNotFoundError:
        print("❌ Nie znaleziono pliku dctl_tutorial_complete.md")
        return
    
    print(f"📄 Oryginalny rozmiar: {len(original_content)} znaków")
    
    # Wyczyść zawartość
    cleaned_content = clean_markdown_content(original_content)
    
    print(f"✨ Rozmiar po czyszczeniu: {len(cleaned_content)} znaków")
    print(f"🗑️  Usunięto: {len(original_content) - len(cleaned_content)} znaków ({((len(original_content) - len(cleaned_content)) / len(original_content) * 100):.1f}%)")
    
    # Zapisz wyczyszczoną wersję
    with open('dctl_tutorial_cleaned.md', 'w', encoding='utf-8') as f:
        f.write(cleaned_content)
    
    print("✅ Zapisano wyczyszczoną wersję jako 'dctl_tutorial_cleaned.md'")
    
    # Pokaż przykłady usuniętych elementów
    print("\n🔍 Analiza usuniętych elementów:")
    
    # Sprawdź co zostało usunięte
    removed_elements = []
    
    if "Report\nThere was a problem reporting this post" in original_content:
        removed_elements.append("Elementy zgłaszania postów")
    
    if "Block Member?" in original_content:
        removed_elements.append("Elementy blokowania użytkowników")
        
    if "Tutorial Library Index" in original_content:
        removed_elements.append("Menu nawigacyjne")
        
    if "Our Products" in original_content:
        removed_elements.append("Elementy stopki")
        
    if "Member Content" in original_content:
        removed_elements.append("Elementy członkostwa")
    
    for element in removed_elements:
        print(f"  ✓ {element}")
    
    if not removed_elements:
        print("  ℹ️  Nie wykryto typowych elementów do usunięcia")

if __name__ == "__main__":
    test_cleaning()