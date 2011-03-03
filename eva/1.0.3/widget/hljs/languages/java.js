﻿/*
Language: Java
Author: Vsevolod Solovyov <vsevolod.solovyov@gmail.com>
*/

hljs.LANGUAGES.java  = {
  defaultMode: {
    lexems: [hljs.UNDERSCORE_IDENT_RE],
    contains: ['javadoc', 'comment', 'string', 'class', 'number', 'annotation'],
    keywords: {'false': 1, 'synchronized': 1, 'int': 1, 'abstract': 1, 'float': 1, 'private': 1, 'char': 1, 'interface': 1, 'boolean': 1, 'static': 1, 'null': 1, 'if': 1, 'const': 1, 'for': 1, 'true': 1, 'while': 1, 'long': 1, 'throw': 1, 'strictfp': 1, 'finally': 1, 'protected': 1, 'extends': 1, 'import': 1, 'native': 1, 'final': 1, 'implements': 1, 'return': 1, 'void': 1, 'enum': 1, 'else': 1, 'break': 1, 'transient': 1, 'new': 1, 'catch': 1, 'instanceof': 1, 'byte': 1, 'super': 1, 'class': 1, 'volatile': 1, 'case': 1, 'assert': 1, 'short': 1, 'package': 1, 'default': 1, 'double': 1, 'public': 1, 'try': 1, 'this': 1, 'switch': 1, 'continue': 1, 'throws': 1}
  },
  modes: [
    {
      className: 'class',
      lexems: [hljs.UNDERSCORE_IDENT_RE],
      begin: '(class |interface )', end: '{',
      illegal: ':',
      keywords: {'class': 1, 'interface': 1},
      contains: ['inheritance', 'title']
    },
    {
      className: 'inheritance',
      begin: '(implements|extends)', end: '^', noMarkup: true,
      lexems: [hljs.IDENT_RE],
      keywords: {'extends': 1, 'implements': 1},
      relevance: 10
    },
    {
      className: 'title',
      begin: hljs.UNDERSCORE_IDENT_RE, end: '^'
    },
    {
      className: 'params',
      begin: '\\(', end: '\\)',
      contains: ['string', 'annotation']
    },
    hljs.C_NUMBER_MODE,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    hljs.BACKSLASH_ESCAPE,
    hljs.C_LINE_COMMENT_MODE,
    {
      className: 'javadoc',
      begin: '/\\*\\*', end: '\\*/',
      contains: ['javadoctag'],
      relevance: 10
    },
    {
      className: 'javadoctag',
      begin: '@[A-Za-z]+', end: '^'
    },
    hljs.C_BLOCK_COMMENT_MODE,
    {
      className: 'annotation',
      begin: '@[A-Za-z]+', end: '^'
    }
  ]
};
