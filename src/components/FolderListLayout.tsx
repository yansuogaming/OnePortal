import type { OdFolderChildren } from '../types'

import Link from 'next/link'
import { FC, useState } from 'react'
import { useClipboard } from 'use-clipboard-copy'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'

import { getBaseUrl } from '../utils/getBaseUrl'
import { formatModifiedDateTime, humanFileSize } from '../utils/fileDetails'

import { Checkbox, ChildIcon, ChildName, Downloading } from './FileListing'
import { getStoredToken } from '../utils/protectedRouteHandler'

const FileListItem: FC<{ fileContent: OdFolderChildren }> = ({ fileContent: c }) => {
  return (
    <div className="grid cursor-pointer grid-cols-10 items-center space-x-2 px-3 py-2.5">
      <div className="col-span-10 flex items-center space-x-2 truncate md:col-span-6" title={c.name}>
        <div className="w-5 flex-shrink-0 text-center">
          <ChildIcon child={c} />
        </div>
        <ChildName name={c.name} folder={Boolean(c.folder)} />
      </div>
      <div className="col-span-3 hidden flex-shrink-0 font-mono text-sm text-gray-700 md:block dark:text-gray-500">
        {formatModifiedDateTime(c.lastModifiedDateTime)}
      </div>
      <div className="col-span-1 hidden flex-shrink-0 truncate font-mono text-sm text-gray-700 md:block dark:text-gray-500">
        {humanFileSize(c.size)}
      </div>
    </div>
  )
}

const FolderListLayout = ({
  path,
  folderChildren,
  selected,
  toggleItemSelected,
  totalSelected,
  toggleTotalSelected,
  totalGenerating,
  handleSelectedDownload,
  folderGenerating,
  handleSelectedPermalink,
  handleFolderDownload,
  toast,
}) => {
  const clipboard = useClipboard()
  const token = getStoredToken(path)

  // Get item path from item name
  const getItemPath = (name: string) => `${path === '/' ? '' : path}/${encodeURIComponent(name)}`

  // State for sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  })

  // Handle sort click
  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  // Sort folderChildren
  const sortedChildren = [...folderChildren].sort((a, b) => {
    let aValue, bValue
    switch (sortConfig.key) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'lastModifiedDateTime':
        aValue = a.lastModifiedDateTime
        bValue = b.lastModifiedDateTime
        break
      case 'size':
        aValue = a.size
        bValue = b.size
        break
      default:
        return 0
    }
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="rounded bg-white shadow-sm dark:bg-gray-900 dark:text-gray-100">
      <div className="grid grid-cols-12 items-center space-x-2 border-b border-gray-900/10 px-3 dark:border-gray-500/30">
        <div
          className="col-span-12 flex cursor-pointer items-center py-2 text-xs font-bold uppercase tracking-widest text-gray-600 md:col-span-6 dark:text-gray-300"
          onClick={() => handleSort('name')}
        >
          {'Name'}
          {sortConfig.key === 'name' && (
            <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faSortUp : faSortDown} className="ml-1" />
          )}
        </div>
        <div
          className="col-span-3 hidden flex cursor-pointer items-center text-xs font-bold uppercase tracking-widest text-gray-600 md:block dark:text-gray-300"
          onClick={() => handleSort('lastModifiedDateTime')}
        >
          {'Last Modified'}
          {sortConfig.key === 'lastModifiedDateTime' && (
            <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faSortUp : faSortDown} className="ml-1" />
          )}
        </div>
        <div
          className="flex hidden cursor-pointer items-center text-xs font-bold uppercase tracking-widest text-gray-600 md:block dark:text-gray-300"
          onClick={() => handleSort('size')}
        >
          {'Size'}
          {sortConfig.key === 'size' && (
            <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faSortUp : faSortDown} className="ml-1" />
          )}
        </div>
        <div className="hidden text-xs font-bold uppercase tracking-widest text-gray-600 md:block dark:text-gray-300">
          {'Actions'}
        </div>
        <div className="hidden text-xs font-bold uppercase tracking-widest text-gray-600 md:block dark:text-gray-300">
          <div className="hidden p-1.5 text-gray-700 md:flex dark:text-gray-400">
            <Checkbox
              checked={totalSelected}
              onChange={toggleTotalSelected}
              indeterminate={true}
              title={'Select files'}
            />
            <button
              title={'Copy selected files permalink'}
              className="cursor-pointer rounded p-1.5 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 disabled:dark:text-gray-600 disabled:hover:dark:bg-gray-900"
              disabled={totalSelected === 0}
              onClick={() => {
                clipboard.copy(handleSelectedPermalink(getBaseUrl()))
                toast.success('Copied selected files permalink.')
              }}
            >
              <FontAwesomeIcon icon={['far', 'copy']} size="lg" />
            </button>
            {totalGenerating ? (
              <Downloading title={'Downloading selected files, refresh page to cancel'} style="p-1.5" />
            ) : (
              <button
                title={'Download selected files'}
                className="cursor-pointer rounded p-1.5 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 disabled:dark:text-gray-600 disabled:hover:dark:bg-gray-900"
                disabled={totalSelected === 0}
                onClick={handleSelectedDownload}
              >
                <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} size="lg" />
              </button>
            )}
          </div>
        </div>
      </div>

      {sortedChildren.map((c: OdFolderChildren) => (
        <div
          className="grid grid-cols-12 transition-all duration-100 hover:bg-gray-100 dark:hover:bg-gray-850"
          key={c.id}
        >
          <Link
            href={`${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`}
            passHref
            className="col-span-12 md:col-span-10"
          >
            <FileListItem fileContent={c} />
          </Link>

          {c.folder ? (
            <div className="hidden p-1.5 text-gray-700 md:flex dark:text-gray-400">
              <span
                title={'Copy folder permalink'}
                className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => {
                  clipboard.copy(`${getBaseUrl()}${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`)
                  toast('Copied folder permalink.', { icon: '👌' })
                }}
              >
                <FontAwesomeIcon icon={['far', 'copy']} />
              </span>
              {folderGenerating[c.id] ? (
                <Downloading title={'Downloading folder, refresh page to cancel'} style="px-1.5 py-1" />
              ) : (
                <span
                  title={'Download folder'}
                  className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={() => {
                    const p = `${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`
                    handleFolderDownload(p, c.id, c.name)()
                  }}
                >
                  <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
                </span>
              )}
            </div>
          ) : (
            <div className="hidden p-1.5 text-gray-700 md:flex dark:text-gray-400">
              <span
                title={'Copy raw file permalink'}
                className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => {
                  clipboard.copy(
                    `${getBaseUrl()}/api/raw?path=${getItemPath(c.name)}${token ? `&odpt=${encodeURIComponent(token)}` : ''}`,
                  )
                  toast.success('Copied raw file permalink.')
                }}
              >
                <FontAwesomeIcon icon={['far', 'copy']} />
              </span>
              <a
                title={'Download file'}
                className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                href={`/api/raw?path=${getItemPath(c.name)}${token ? `&odpt=${encodeURIComponent(token)}` : ''}`}
              >
                <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
              </a>
            </div>
          )}
          <div className="hidden p-1.5 text-gray-700 md:flex dark:text-gray-400">
            {!c.folder && !(c.name === '.password') && (
              <Checkbox
                checked={selected[c.id] ? 2 : 0}
                onChange={() => toggleItemSelected(c.id)}
                title={'Select file'}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default FolderListLayout
