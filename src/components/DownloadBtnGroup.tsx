import { MouseEventHandler, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import toast from 'react-hot-toast'
import { useClipboard } from 'use-clipboard-copy'

import Image from 'next/image'
import { useRouter } from 'next/router'

import siteConfig from '../../config/site.config'
import { getBaseUrl } from '../utils/getBaseUrl'
import { getStoredToken } from '../utils/protectedRouteHandler'
import CustomEmbedLinkMenu from './CustomEmbedLinkMenu'

const btnStyleMap = (btnColor?: string) => {
  const colorMap = {
    gray: 'hover:text-gray-600 dark:hover:text-white focus:ring-gray-200 focus:text-gray-600 dark:focus:text-white border-gray-300 dark:border-gray-500 dark:focus:ring-gray-500',
    blue: 'hover:text-blue-600 focus:ring-blue-200 focus:text-blue-600 border-blue-300 dark:border-blue-700 dark:focus:ring-blue-500',
    teal: 'hover:text-teal-600 focus:ring-teal-200 focus:text-teal-600 border-teal-300 dark:border-teal-700 dark:focus:ring-teal-500',
    red: 'hover:text-red-600 focus:ring-red-200 focus:text-red-600 border-red-300 dark:border-red-700 dark:focus:ring-red-500',
    green:
      'hover:text-green-600 focus:ring-green-200 focus:text-green-600 border-green-300 dark:border-green-700 dark:focus:ring-green-500',
    pink: 'hover:text-pink-600 focus:ring-pink-200 focus:text-pink-600 border-pink-300 dark:border-pink-700 dark:focus:ring-pink-500',
    yellow:
      'hover:text-yellow-400 focus:ring-yellow-100 focus:text-yellow-400 border-yellow-300 dark:border-yellow-400 dark:focus:ring-yellow-300',
  }

  if (btnColor) {
    return colorMap[btnColor]
  }

  return colorMap.gray
}

export const DownloadButton = ({
  onClickCallback,
  btnColor,
  btnText,
  btnIcon,
  btnImage,
  btnTitle,
  disabled,
}: {
  onClickCallback: MouseEventHandler<HTMLButtonElement>
  btnColor?: string
  btnText: string
  btnIcon?: IconProp
  btnImage?: string
  btnTitle?: string
  disabled?: boolean
}) => {
  return (
    <button
      className={`flex items-center space-x-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100/10 focus:z-10 focus:ring-2 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-900 ${
        disabled ? 'border-gray-300 dark:border-gray-500' : btnStyleMap(btnColor)
      }`}
      title={btnTitle}
      onClick={onClickCallback}
      disabled={disabled}
    >
      {btnIcon && <FontAwesomeIcon icon={btnIcon} />}
      {btnImage && <Image src={btnImage} alt={btnImage} width={20} height={20} priority />}
      <span>{btnText}</span>
    </button>
  )
}

const DownloadButtonGroup = () => {
  const { asPath } = useRouter()
  const token = getStoredToken(asPath)

  const clipboard = useClipboard()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <CustomEmbedLinkMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} path={asPath} />
      <div className="flex flex-wrap justify-center gap-2">
{/*         <DownloadButton
          onClickCallback={() =>
            window.open(`/api/raw?path=${asPath}${token ? `&odpt=${encodeURIComponent(token)}` : ''}`)
          }
          btnColor="blue"
          btnText={'Download'}
          btnIcon="file-download"
          btnTitle={'Download the file directly through OneDrive'}
        /> */}
{/*         <DownloadButton
          onClickCallback={() =>
            window.open(`/api/raw?path=${asPath}${token ? `&odpt=${encodeURIComponent(token)}` : ''}&proxy=true`)
          }
          btnColor="yellow"
          btnText={'Proxy Download'}
          btnIcon="download"
          btnTitle={'Download the file via Cloudflare network'}
          disabled={!siteConfig.allowProxy}
        /> */}
        <DownloadButton
          onClickCallback={() => {
            clipboard.copy(`${getBaseUrl()}/api/raw?path=${asPath}${token ? `&odpt=${encodeURIComponent(token)}` : ''}`)
            toast.success('Copied direct link to clipboard.')
          }}
          btnColor="pink"
          btnText={'Copy direct link'}
          btnIcon="copy"
          btnTitle={'Copy the permalink to the file to the clipboard'}
        />
{/*         <DownloadButton
          onClickCallback={() => {
            clipboard.copy(
              `${getBaseUrl()}/api/raw?path=${asPath}${token ? `&odpt=${encodeURIComponent(token)}` : ''}&proxy=true`,
            )
            toast.success('Copied proxy link to clipboard.')
          }}
          btnColor="green"
          btnText={'Copy proxy link'}
          btnIcon="copy"
          btnTitle={'Copy the permalink to the file to the clipboard'}
          disabled={!siteConfig.allowProxy}
        /> */}
{/*         <DownloadButton
          onClickCallback={() => setMenuOpen(true)}
          btnColor="teal"
          btnText={'Customise link'}
          btnIcon="pen"
        /> */}
      </div>
    </>
  )
}

export default DownloadButtonGroup
