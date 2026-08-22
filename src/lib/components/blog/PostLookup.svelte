<script lang="ts">
  import { sanitizeHighlight } from "$lib/search/highlight";
  import type { PostListItem } from "$lib/posts/types";

  interface Props {
    id: string;
    posts: PostListItem[];
    activeIndex: number;
    onSelect: (post: PostListItem) => void;
    onHover: (index: number) => void;
  }

  let { id, posts, activeIndex, onSelect, onHover }: Props = $props();

  function titleHtml(post: PostListItem) {
    return sanitizeHighlight(post.highlight?.title ?? post.title);
  }

  function metaHtml(post: PostListItem) {
    if (post.highlight?.authorName) {
      return sanitizeHighlight(post.highlight.authorName);
    }

    if (post.highlight?.tag) {
      return sanitizeHighlight(post.highlight.tag);
    }

    if (post.highlight?.excerpt) {
      return sanitizeHighlight(post.highlight.excerpt);
    }

    return post.authorName;
  }
</script>

<ul
  {id}
  role="listbox"
  class="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
>
  {#each posts as post, index (post.id)}
    <li role="presentation">
      <a
        id={`${id}-option-${index}`}
        role="option"
        aria-selected={index === activeIndex}
        href={`/blog/${post.slug}`}
        class="block px-4 py-3 transition {index === activeIndex
          ? 'bg-[#ffe1ca]/8'
          : 'hover:bg-[#ffe1ca]/5'}"
        onmouseenter={() => onHover(index)}
        onclick={(event) => {
          event.preventDefault();
          onSelect(post);
        }}
      >
        <p class="truncate font-[Oxanium] text-sm text-[#f7eee7]">
          {@html titleHtml(post)}
        </p>
        <p class="mt-1 truncate text-xs text-[#f4ebe3]/45">
          {@html metaHtml(post)}
        </p>
      </a>
    </li>
  {/each}
</ul>
